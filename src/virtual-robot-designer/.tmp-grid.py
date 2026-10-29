import sys
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]
ims=[Image.open(f).resize((645,494)) for f in files]
cols=2; rows=(len(ims)+1)//2
W=Image.new('RGB',(645*cols,494*rows))
for i,im in enumerate(ims): W.paste(im,((i%cols)*645,(i//cols)*494))
W.save(out)
