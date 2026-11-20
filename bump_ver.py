# -*- coding: utf-8 -*-
import re
p = r'E:\zcode\玩\绿血的拯救\index.html'
d = open(p, 'rb').read().decode('utf-8')
d = re.sub(r'src="(js/[^"]+?\.js)"', lambda m: 'src="%s?v=26"' % m.group(1), d)
d = d.replace('href="css/style.css"', 'href="css/style.css?v=26"')
open(p, 'wb').write(d.encode('utf-8'))
print('done')
