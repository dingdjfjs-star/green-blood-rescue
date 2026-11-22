# -*- coding: utf-8 -*-
import re
p = r'E:\zcode\玩\绿血的拯救\index.html'
d = open(p, 'rb').read().decode('utf-8')
d = re.sub(r'\?v=\d+"', '?v=31"', d)   # 通用版本号提升：任何 ?v=N 引用一律改写（含不带版本号的由上一行先补）
open(p, 'wb').write(d.encode('utf-8'))
print('done')
