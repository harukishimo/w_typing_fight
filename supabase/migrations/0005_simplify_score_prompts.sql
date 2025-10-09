-- Simplify SCORE difficulty prompts for score attack mode
delete from public.typing_prompts where difficulty = 'SCORE';

insert into public.typing_prompts (text, reading, romaji, difficulty, char_count) values
  ('夏祭りの広場で子どもたちが笑う', 'なつまつりのひろばでこどもたちがわらう', 'natsumatsurinohirobadekodomotachigawarau', 'SCORE', 19),
  ('朝焼けの港で漁船が静かに揺れる', 'あさやけのみなとでぎょせんがしずかにゆれる', 'asayakenominatodegyosengashizukaniyureru', 'SCORE', 21),
  ('秋風の通り道で落ち葉が舞い続ける', 'あきかぜのとおりみちでおちばがまいつづける', 'akikazenotoorimichideochibagamaitsuzukeru', 'SCORE', 21),
  ('冬の駅前で白い息が星空に消える', 'ふゆのえきまえでしろいいきがほしぞらにきえる', 'fuyunoekimaedeshiroiikigahoshizoranikieru', 'SCORE', 22),
  ('図書室の窓辺で雨音を聞きながら読む', 'としょしつのまどべであまおとをききながらよむ', 'toshoshitsunomadobedeamaotowokikinarayomu', 'SCORE', 22),
  ('春の川辺で友だちと写真を撮り合う', 'はるのかわべでともだちとしゃしんをとりあう', 'harunokawabedotomodachitoshashinwotoriau', 'SCORE', 21),
  ('夕暮れの公園で犬が駆け回って遊ぶ', 'ゆうぐれのこうえんでいぬがかけまわってあそぶ', 'yuugurenokouendeinugakakemawatteasobu', 'SCORE', 22),
  ('静かな美術室で筆音が優しく響く', 'しずかなびじゅつしつでふでおとがやさしくひびく', 'shizukanabijutsushitsudefudeotogayasashikuhibiku', 'SCORE', 23),
  ('朝の体育館で皆がストレッチをしている', 'あさのたいいくかんでみながすとれっちをしている', 'asanotaiikukandeminagasutoretchiwoshiteiru', 'SCORE', 23),
  ('星空のベランダで熱いココアを分け合う', 'ほしぞらのべらんだであついここあをわけあう', 'hoshizoranoberandadeatsuikokoaowakeau', 'SCORE', 21),
  ('冬休みの食堂で友だちと鍋を囲む', 'ふゆやすみのしょくどうでともだちとなべをかこむ', 'fuyuyasuminoshokudodetomodachitonabewokakomu', 'SCORE', 23),
  ('夏の校庭で打ち上げ花火の練習をする', 'なつのこうていでうちあげはなびのれんしゅうをする', 'natsunokouteideuchiagehanabinorenshuuwosuru', 'SCORE', 24),
  ('教室の黒板に今日の目標が大きく書かれる', 'きょうしつのこくばんにきょうのもくひょうがおおきくかかれる', 'kyoushitsunokokubannikyounomokuhyougaookikukakareru', 'SCORE', 29),
  ('昼休みの図書館で新刊の雑誌を順番に読む', 'ひるやすみのとしょかんでしんかんのざっしをじゅんばんによむ', 'hiruyasuminotoshokandeshinkannozasshiojunbaniniyomu', 'SCORE', 29),
  ('海沿いの散歩道で風を感じる', 'うみぞいのさんぽみちでかぜをかんじる', 'umizoinosanpomichidekazewokanjiru', 'SCORE', 18),
  ('雨上がりの商店街で色とりどりの傘が行き交う', 'あめあがりのしょうてんがいでいろとりどりのかさがいきかう', 'ameagarinoshoutengaideirotoridorinokasagaikikau', 'SCORE', 28),
  ('放課後の音楽室でピアノと歌声が響く', 'ほうかごのおんがくしつでぴあのとうたごえがひびく', 'houkagonoongakushitsudepianotoutagoegahibiku', 'SCORE', 24),
  ('夕立の後に虹が校舎の上へかかる', 'ゆうだちのあとににじがこうしゃのうえへかかる', 'yuudachinoatoninijigakoushanouehekakaru', 'SCORE', 21),
  ('朝練のグラウンドでボールを追いかける', 'あされんのぐらうんどでぼーるをおいかける', 'asarennoguraundobooruwooikakeru', 'SCORE', 20),
  ('部室の白板に次の試合の予定が書かれる', 'ぶしつのはくばんにつぎのしあいのよていがかかれる', 'bushitsunohakubannitsuginoshiaiyoteigakakareru', 'SCORE', 24),
  ('午後の教室で静かな小テストが始まる', 'ごごのきょうしつでしずかなしょうてすとがはじまる', 'gogonokyoushitsudeshizukanashoutesutogahajimaru', 'SCORE', 24);
