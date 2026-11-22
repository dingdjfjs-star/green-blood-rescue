"""绿血的拯救 - 本地服务器：静态文件 + /tts 神经网络语音接口（Edge TTS，免费无密钥）
用法：E:\\Ana\\python.exe server.py  →  http://127.0.0.1:8945/
接口：/tts?text=...&voice=zh-CN-XiaoxiaoNeural&rate=-12%  → audio/mpeg
缓存：tts_cache/ 目录按文本+声源+语速哈希落盘，同句二次播放零延迟
"""
import http.server, socketserver, urllib.parse, hashlib, os, asyncio, sys

PORT = 8945
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, 'tts_cache')
os.makedirs(CACHE, exist_ok=True)

try:
    from edge_tts import Communicate
except ImportError:
    print('ERROR: edge-tts not installed. Run: python -m pip install edge-tts', flush=True)
    sys.exit(1)

async def synth(text, voice, rate, out):
    cm = Communicate(text, voice, rate=rate)
    await cm.save(out)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def handle_one_request(self):
        # 浏览器中途取消请求（切后台/重载）在 Windows 上会抛 ConnectionAbortedError
        # 不能让它崩掉工作线程以外的任何东西，直接吞掉
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, TimeoutError):
            self.close_connection = True

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store')  # 开发期资源常改，禁止浏览器缓存
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # 静音访问日志

    def do_GET(self):
        try:
            p = urllib.parse.urlparse(self.path)
            if p.path == '/tts':
                self.handle_tts(p)
                return
            if p.path == '/ping':
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write('pong'.encode())
                return
            return super().do_GET()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            self.close_connection = True

    def handle_tts(self, p):
        q = urllib.parse.parse_qs(p.query)
        text = (q.get('text', [''])[0])[:600]
        voice = q.get('voice', ['zh-CN-XiaoxiaoNeural'])[0]
        rate = q.get('rate', ['+0%'])[0]
        if not text.strip():
            self.send_error(400, 'empty text')
            return
        key = hashlib.md5((voice + '|' + rate + '|' + text).encode()).hexdigest()
        out = os.path.join(CACHE, key + '.mp3')
        if not os.path.exists(out):
            try:
                asyncio.run(synth(text, voice, rate, out))
            except Exception as e:
                msg = ('tts failed: %s' % e).encode()
                self.send_response(502)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Content-Length', str(len(msg)))
                self.end_headers()
                self.wfile.write(msg)
                return
        try:
            data = open(out, 'rb').read()
        except OSError:
            self.send_error(500)
            return
        self.send_response(200)
        self.send_header('Content-Type', 'audio/mpeg')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == '__main__':
    # 主循环兜底：任何致命异常后自动重启监听
    while True:
        try:
            with Server(('127.0.0.1', PORT), Handler) as httpd:
                print('GreenBlood server on http://127.0.0.1:%d  (tts_cache=%s)' % (PORT, CACHE), flush=True)
                httpd.serve_forever()
        except KeyboardInterrupt:
            print('bye', flush=True)
            break
        except Exception as e:
            print('server crashed (%s), restarting...' % e, flush=True)
