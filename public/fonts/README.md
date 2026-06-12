# Local Bengali Fonts / লোকাল বাংলা ফন্ট

এই ফোল্ডারে নিচের ফ্রি বাংলা ফন্টগুলোর TTF ফাইল রাখুন (ফাইলের নাম হুবহু এক রাখবেন):

| File name          | Font          | Free download                          |
| ------------------ | ------------- | -------------------------------------- |
| `Kalpurush.ttf`    | কালপুরুষ      | omicronlab.com → Bangla Fonts          |
| `SolaimanLipi.ttf` | সোলায়মান লিপি | omicronlab.com → Bangla Fonts          |
| `SiyamRupali.ttf`  | সিয়াম রূপালী  | omicronlab.com → Bangla Fonts          |
| `AdorshoLipi.ttf`  | আদর্শলিপি     | omicronlab.com → Bangla Fonts          |

ফাইল রাখার পর আর কিছু করতে হবে না — `globals.css`-এর `@font-face` রুলগুলো
স্বয়ংক্রিয়ভাবে এগুলো লোড করবে।

> বিকল্প: অ্যাপের ভিতরে **Text → ফন্ট → কাস্টম ফন্ট আপলোড** দিয়ে যেকোনো
> TTF/OTF ফন্ট সরাসরি আপলোড করেও ব্যবহার করতে পারবেন (IndexedDB-তে সেভ থাকে)।
