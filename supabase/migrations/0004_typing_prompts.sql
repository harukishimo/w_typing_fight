-- Create difficulty enum if it does not exist
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'typing_difficulty' and n.nspname = 'public'
  ) then
    create type public.typing_difficulty as enum ('EASY', 'NORMAL', 'SCORE', 'HARD');
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'typing_difficulty'
      and n.nspname = 'public'
      and not exists (
        select 1 from pg_enum e
        where e.enumtypid = t.oid and e.enumlabel = 'SCORE'
      )
  ) then
    alter type public.typing_difficulty add value 'SCORE';
  end if;
end $$;

-- Create typing_prompts table
create table if not exists public.typing_prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  reading text not null,
  romaji text not null,
  difficulty public.typing_difficulty not null,
  char_count integer not null check (char_count > 0),
  category text,
  created_at timestamptz not null default now()
);

create index if not exists typing_prompts_difficulty_idx on public.typing_prompts (difficulty);
create index if not exists typing_prompts_char_count_idx on public.typing_prompts (char_count);
create unique index if not exists typing_prompts_text_difficulty_unique
  on public.typing_prompts (text, difficulty);

alter table public.typing_prompts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'typing_prompts'
      and policyname = 'typing_prompts_public_read'
  ) then
    create policy typing_prompts_public_read
      on public.typing_prompts
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'typing_prompts'
      and policyname = 'typing_prompts_service_insert'
  ) then
    create policy typing_prompts_service_insert
      on public.typing_prompts
      for insert
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'typing_prompts'
      and policyname = 'typing_prompts_service_update'
  ) then
    create policy typing_prompts_service_update
      on public.typing_prompts
      for update
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'typing_prompts'
      and policyname = 'typing_prompts_service_delete'
  ) then
    create policy typing_prompts_service_delete
      on public.typing_prompts
      for delete
      using (auth.role() = 'service_role');
  end if;
end $$;

insert into public.typing_prompts (text, reading, romaji, difficulty, char_count)
values
  -- EASY
  ('みかん', 'みかん', 'mikan', 'EASY', 4),
  ('わかやま', 'わかやま', 'wakayama', 'EASY', 5),
  ('うめぼし', 'うめぼし', 'umeboshi', 'EASY', 5),
  ('ぱんだ', 'ぱんだ', 'panda', 'EASY', 4),
  ('らーめん', 'らーめん', 'ra-men', 'EASY', 5),
  ('おんせん', 'おんせん', 'onsen', 'EASY', 5),
  ('かつお', 'かつお', 'katuo', 'EASY', 4),
  ('しらす', 'しらす', 'shirasu', 'EASY', 4),
  ('たいよう', 'たいよう', 'taiyou', 'EASY', 5),
  ('なつまつり', 'なつまつり', 'natsumatsuri', 'EASY', 6),
  ('やまのぼり', 'やまのぼり', 'yamanobori', 'EASY', 6),
  ('さくら', 'さくら', 'sakura', 'EASY', 4),
  ('ゆうひ', 'ゆうひ', 'yuuhi', 'EASY', 4),
  ('あまぐも', 'あまぐも', 'amagumo', 'EASY', 5),
  ('かもめ', 'かもめ', 'kamome', 'EASY', 4),
  ('こはく', 'こはく', 'kohaku', 'EASY', 4),
  ('ひのき', 'ひのき', 'hinoki', 'EASY', 3),
  ('たんぽぽ', 'たんぽぽ', 'tanpopo', 'EASY', 4),
  ('つばめ', 'つばめ', 'tsubame', 'EASY', 3),
  ('こいのぼり', 'こいのぼり', 'koinobori', 'EASY', 5),
  ('しおさい', 'しおさい', 'shiosai', 'EASY', 4),
  ('あじさい', 'あじさい', 'ajisai', 'EASY', 4),
  ('ひまわり', 'ひまわり', 'himawari', 'EASY', 4),
  ('すいかあめ', 'すいかあめ', 'suikaame', 'EASY', 5),
  ('なないろ', 'なないろ', 'nanairo', 'EASY', 4),
  ('かきごおり', 'かきごおり', 'kakigoori', 'EASY', 5),
  ('あさがお', 'あさがお', 'asagao', 'EASY', 4),
  ('えのきたけ', 'えのきたけ', 'enokitake', 'EASY', 5),
  ('もみじば', 'もみじば', 'momijiba', 'EASY', 4),
  ('ほたるび', 'ほたるび', 'hotarubi', 'EASY', 4),
  ('さざなみ', 'さざなみ', 'sazanami', 'EASY', 4),
  ('ゆきだるま', 'ゆきだるま', 'yukidaruma', 'EASY', 5),
  ('ふうりん', 'ふうりん', 'fuurin', 'EASY', 4),
  ('おでんや', 'おでんや', 'odenya', 'EASY', 4),
  ('かぜぐるま', 'かぜぐるま', 'kazeguruma', 'EASY', 5),
  ('こまいぬ', 'こまいぬ', 'komainu', 'EASY', 4),
  ('まんじゅう', 'まんじゅう', 'manjuu', 'EASY', 5),
  ('ぬくもり', 'ぬくもり', 'nukumori', 'EASY', 4),
  ('かげろう', 'かげろう', 'kagerou', 'EASY', 4),
  ('こしかけ', 'こしかけ', 'koshikake', 'EASY', 4),
  ('まきばのおと', 'まきばのおと', 'makibanooto', 'EASY', 6),
  ('きつねび', 'きつねび', 'kitsunebi', 'EASY', 4),
  ('たからばこ', 'たからばこ', 'takarabako', 'EASY', 5),
  ('ふくろう', 'ふくろう', 'fukurou', 'EASY', 4),
  ('もりのこえ', 'もりのこえ', 'morinokoe', 'EASY', 5),
  ('ほしぞら', 'ほしぞら', 'hoshizora', 'EASY', 4),
  ('ゆうやけぐも', 'ゆうやけぐも', 'yuuyakegumo', 'EASY', 6),
  ('しろつめくさ', 'しろつめくさ', 'shirotsumekusa', 'EASY', 6),
  -- NORMAL
  ('和歌山ラーメン', 'わかやまらーめん', 'wakayamara-men', 'NORMAL', 8),
  ('パンダの赤ちゃん', 'ぱんだのあかちゃん', 'pandanoakachan', 'NORMAL', 9),
  ('有田みかんジュース', 'ありたみかんじゅーす', 'aritamikanjyu-su', 'NORMAL', 10),
  ('南紀白浜温泉', 'なんきしらはまおんせん', 'nankishirahamaonsen', 'NORMAL', 8),
  ('熊野古道を歩く', 'くまのこどうをあるく', 'kumanokodouoaruku', 'NORMAL', 8),
  ('紀州梅干しの名産地', 'きしゅううめぼしのめいさんち', 'kishuumeboshinomeisanchi', 'NORMAL', 11),
  ('高野山金剛峯寺', 'こうやさんこんごうぶじ', 'kouyasankongoubujl', 'NORMAL', 8),
  ('熊野古道の石畳', 'くまのこどうのいしだたみ', 'kumanokodounoishidatami', 'NORMAL', 11),
  ('潮風が香る港町', 'しおかぜがかおるみなとまち', 'shiokazegakaoruminatomachi', 'NORMAL', 11),
  ('秋の紅葉ライトアップ', 'あきのこうようらいとあっぷ', 'akinokouyouraitoappu', 'NORMAL', 11),
  ('白浜の砂浜で遊ぶ', 'しらはまのすなはまであそぶ', 'shirahamanosunahamadeasobu', 'NORMAL', 11),
  ('紀伊水道を渡る船', 'きいすいどうをわたるふね', 'kiisuidoouwatarufune', 'NORMAL', 10),
  ('温泉街の湯けむり', 'おんせんがいのゆけむり', 'onsengainoyukemuri', 'NORMAL', 10),
  ('南高梅の収穫祭', 'なんこううめのしゅうかくさい', 'nankouumenoshuukakusai', 'NORMAL', 11),
  ('熊野川でカヤック体験', 'くまのがわでかやっくたいけん', 'kumanogawadekayakkutatiken', 'NORMAL', 12),
  ('夜空を彩る花火大会', 'よぞらをいろどるはなびたいかい', 'yozorawirodoruhanabitaikai', 'NORMAL', 12),
  ('漁師町の朝市に行く', 'りょうしまちのあさいちにいく', 'ryoushimachinoasaichiniiku', 'NORMAL', 11),
  ('紀州備長炭で焼く串', 'きしゅうびんちょうたんでやくくし', 'kishuubinchohdeyakukushi', 'NORMAL', 12),
  ('熊野本宮大社を参拝', 'くまのほんぐうたいしゃをさんぱい', 'kumanohonguutaisyawosanpai', 'NORMAL', 12),
  ('夕暮れの海岸を散歩する', 'ゆうぐれのかいがんをさんぽする', 'yuugurenokaiganosanposuru', 'NORMAL', 15),
  ('梅の香る公園で深呼吸', 'うめのかおるこうえんでしんこきゅう', 'umenokaorukouendeshinkokyuu', 'NORMAL', 17),
  ('朝市でしらすを買う', 'あさいちでしらすをかう', 'asaichideshirasuokau', 'NORMAL', 11),
  ('路地裏のカフェで友を待つ', 'ろじうらのかふぇでともをまつ', 'rojiuranokafuedetomoomatsu', 'NORMAL', 14),
  ('波間のボートで陽を浴びる', 'なみまのぼーとでひをあびる', 'namimanobootodehioabiru', 'NORMAL', 13),
  ('古い灯台の階段を登る', 'ふるいとうだいのかいだんをのぼる', 'furuitoudainokaidanonoboru', 'NORMAL', 16),
  ('駅前の屋台でたこ焼きを買う', 'えきまえのやたいでたこやきをかう', 'ekimaenoyataidetakoyakiokau', 'NORMAL', 16),
  ('神社の境内で風鈴が鳴る', 'じんじゃのけいだいでふうりんがなる', 'jinjanokeidaidefuuringanaru', 'NORMAL', 17),
  ('朝霧に包まれた棚田を眺める', 'あさぎりにつつまれたたなだをながめる', 'asagirinitsutsumaretatanadaonagameru', 'NORMAL', 18),
  ('温泉宿でゆったりと湯に浸かる', 'おんせんやどでゆったりとゆにつかる', 'onsenyadodeyuttaritoyunitsukaru', 'NORMAL', 17),
  ('商店街の提灯が夕暮れに灯る', 'しょうてんがいのちょうちんがゆうぐれにともる', 'shoutengainochouchingayuugurenitomoru', 'NORMAL', 22),
  ('緑の渓谷を渡る吊り橋を歩く', 'みどりのけいこくをわたるつりばしをあるく', 'midorinokeikokuowatarutsuribashioaruku', 'NORMAL', 20),
  ('海風を受けて自転車で駆ける', 'うみかぜをうけてじてんしゃでかける', 'umikazeouketejitenshadekakeru', 'NORMAL', 17),
  ('朝焼けに染まる漁港を写す', 'あさやけにそまるぎょこうをうつす', 'asayakenisomarugyokououtsusu', 'NORMAL', 16),
  ('城下町の石畳を歩いて巡る', 'じょうかまちのいしだたみをあるいてめぐる', 'joukamachinoishidatamioaruitemeguru', 'NORMAL', 20),
  ('木漏れ日の遊歩道をゆっくり進む', 'こもれびのゆうほどうをゆっくりすすむ', 'komorebinoyuuhodouoyukkurisusumu', 'NORMAL', 18),
  ('山頂の展望台で雲海を眺める', 'さんちょうのてんぼうだいでうんかいをながめる', 'sanchounotenboudaideunkaionagameru', 'NORMAL', 22),
  ('古民家で炭火の囲炉裏を囲む', 'こみんかですみびのいろりをかこむ', 'kominkadesumibinoiroriokakomu', 'NORMAL', 16),
  ('港の市場で新鮮な鯛を選ぶ', 'みなとのいちばでしんせんなたいをえらぶ', 'minatonoichibadeshinsennataioerabu', 'NORMAL', 19),
  ('朝露に濡れた茶畑を歩く', 'あさつゆにぬれたちゃばたけをあるく', 'asatsuyuninuretachabatakeoaruku', 'NORMAL', 17),
  ('河原で焚き火を囲みながら語る', 'かわらでたきびをかこみながらかたる', 'kawaradetakibiokakominagarakataru', 'NORMAL', 17),
  ('秋祭りの屋台で綿菓子を味わう', 'あきまつりのやたいでわたがしをあじわう', 'akimatsurinoyataidewatagashioajiwau', 'NORMAL', 19),
  ('夜市の光が石畳に揺れて映る', 'よいちのひかりがいしだたみにゆれてうつる', 'yoichinohikarigaishidataminiyureteutsuru', 'NORMAL', 20),
  ('潮風に揺れる漁網を干す', 'しおかぜにゆれるぎょもうをほす', 'shiokazeniyurerugyomouohosu', 'NORMAL', 15),
  ('桟橋で小舟の揺れを感じる', 'さんばしでこぶねのゆれをかんじる', 'sanbashidekobunenoyureokanjiru', 'NORMAL', 16),
  ('露天風呂から星空を仰ぎ見る', 'ろてんぶろからほしぞらをあおぎみる', 'rotenburokarahoshizoraoaogimiru', 'NORMAL', 17),
  ('茶屋で抹茶と和菓子を味わう', 'ちゃやでまっちゃとわがしをあじわう', 'chayademacchatowagashioajiwau', 'NORMAL', 17),
  ('稲穂の波が風に合わせて踊る', 'いなほのなみがかぜにあわせておどる', 'inahononamigakazeniawaseteodoru', 'NORMAL', 17),
  ('修験の山道で木霊の声を聞く', 'しゅげんのやまみちでこだまのこえをきく', 'shugennoyamamichidekodamanokoeokiku', 'NORMAL', 19),
  ('雨上がりの熊野古道が輝く', 'あめあがりのくまのこどうがかがやく', 'ameagarinokumanokodougakagayaku', 'NORMAL', 17),
  ('柑橘香る倉庫で作業を手伝う', 'かんきつかおるそうこでさぎょうをてつだう', 'kankitsukaorusoukodesagyouotetsudau', 'NORMAL', 20),
  ('木の香り漂う工房で器を削る', 'きのかおりただようこうぼうでうつわをけずる', 'kinokaoritadayoukouboudeutsuwaokezuru', 'NORMAL', 21),
  ('棚田の畔で水音とカエルが歌う', 'たなだのあぜでみずおととかえるがうたう', 'tanadanoazedemizuototokaerugautau', 'NORMAL', 19),
  ('祭囃子が響く通りを練り歩く', 'まつりばやしがひびくとおりをねりあるく', 'matsuribayashigahibikutoorioneriaruku', 'NORMAL', 19),
  ('舟着き場で朝日に祈りを捧げる', 'ふなつきばであさひにいのりをささげる', 'funatsukibadeasahiniinoriosasageru', 'NORMAL', 18),
  ('漬物樽の蓋を開け香りを確かめる', 'つけものたるのふたをあけかおりをたしかめる', 'tsukemonotarunofutaoakekaoriotashikameru', 'NORMAL', 21),
  ('風の丘で凧を上げて遊ぶ', 'かぜのおかでたこをあげてあそぶ', 'kazenookadetakooageteasobu', 'NORMAL', 15),
  ('小川のせせらぎに足を浸す', 'おがわのせせらぎにあしをひたす', 'ogawanoseseraginiashiohitasu', 'NORMAL', 15),
  ('山里の囲炉裏で味噌汁を温める', 'やまざとのいろりでみそしるをあたためる', 'yamazatonoiroridemisoshiruoatatameru', 'NORMAL', 19),
  ('白砂の浜辺で貝殻を拾い集める', 'しらすなのはまでかいがらをひろいあつめる', 'shirasunanohamadekaigaraohiroiatsumeru', 'NORMAL', 20),
  -- HARD
  ('紀州徳川家の城下町として栄えた', 'きしゅうとくがわけいのじょうかまちとしてさかえた', 'kishuutokugawakeinojoukamachitoshitesakaeta', 'HARD', 17),
  ('世界遺産に登録された熊野三山への参詣道', 'せかいいさんにとうろくされたくまのさんざんへのさんけいどう', 'sekaiisannitourokusaretakumanosanzanenosankeidou', 'HARD', 22),
  ('和歌山県は温暖な気候で果樹栽培が盛ん', 'わかやまけんはおんだんなきこうでかじゅさいばいがさかん', 'wakayamakenhaondannakikoudekajusaibaiagasakan', 'HARD', 21),
  ('紀伊半島南部に位置する自然豊かな地域', 'きいはんとうなんぶにいちするしぜんゆたかなちいき', 'kiihantounanbuniichisurushizenyutakanachiki', 'HARD', 21),
  ('醤油発祥の地として知られる湯浅町', 'しょうゆはっしょうのちとしてしられるゆあさちょう', 'shouyuhasshounochitoshiteshirareteruyuasachou', 'HARD', 18),
  ('黒潮の恵みを受けた海産物が豊富に獲れる', 'くろしおのめぐみをうけたかいさんぶつがほうふにとれる', 'kuroshioonomegumiwouketakaisanbutsugahoufunitoreru', 'HARD', 23),
  ('熊野速玉大社の神秘的な祭礼行事を見学する', 'くまのはやたまだいしゃのしんぴてきなさいれいぎょうじをけんがくする', 'kumanohayatamadaishanoshinpitekinasaireigyouwokengakusuru', 'HARD', 27),
  ('高野山の宿坊で精進料理を味わいながら静寂を楽しむ', 'こうやさんのしゅくぼうでしょうじんりょうりをあじわいながらせいじゃくをたのしむ', 'kouyasannoshukuboudeshoujinryourioajiwainagaraseijakuwotanoshimu', 'HARD', 32),
  ('那智の滝にかかる虹を撮影しに早朝から山道を進む', 'なちのたきにかかるにじをさつえいしにそうちょうからやまみちをすすむ', 'nachinotakinikakarunijiosatsueishinisouchoukarayamamichiwosusumu', 'HARD', 30),
  ('田辺市の弁慶まつりで伝統芸能と勇壮な武者行列を観覧する', 'たなべしのべんけいまつりででんとうげいのうとゆうそうなむしゃぎょうれつをかんらんする', 'tanabeshibenkeimatsuridedentougeinoutoyuusonamushagyouretsuwokanransuru', 'HARD', 34),
  ('熊野古道の石段を雨に濡れた苔が静かにつつみこむ景色を味わう', 'くまのこどうのいしだんをあめにぬれたこけがしずかにつつみこむけしきをあじわう', 'kumanokodounoishidanoameninuretakokegashizukanitsutsumikomukeshikioajiwau', 'HARD', 38),
  ('高野山の宿坊で夜半に響く読経の声に心を澄ませる', 'こうやさんのしゅくぼうでよわにひびくどきょうのこえにこころをすませる', 'kouyasannoshukuboudeyowanihibikudokyounokoenikokoroosumaseru', 'HARD', 34),
  ('黒潮の荒波を越えて戻る漁船が灯を掲げ港へ滑り込む', 'くろしおのあらなみをこえてもどるぎょせんがひをかかげみなとへすべりこむ', 'kuroshionoaranamiokoetemodorugyosengahiokakageminatohesuberikomu', 'HARD', 35),
  ('紀州備長炭の窯元で炎と炎が交差する熱気を体感する', 'きしゅうびんちょうたんのかまもとでほのおとほのおがこうさするねっきをたいかんする', 'kishuubinchoutannokamamotodehonootohonoogakousasurunekkiotaikansuru', 'HARD', 40),
  ('熊野の森を渡る霧が古社の鳥居を包み神域の気配を漂わせる', 'くまののもりをわたるきりがこしゃのとりいをつつみしんいきのけはいをただよわせる', 'kumanonomoriowatarukirigakoshanotoriiotsutsumishinikinokehaiotadayowaseru', 'HARD', 39),
  ('太地の沖合で躍る鯨の尾が朝焼けの海面を染め上げる光景を眺める', 'たいじのおきあいでおどるくじらのおがあさやけのかいめんをそめあげるこうけいをながめる', 'taijinookiaideodorukujiranoogaasayakenokaimenosomeagerukoukeionagameru', 'HARD', 42),
  ('熊野川を遡る筏下りで激流と静寂が交互に訪れる時間を味わう', 'くまのがわをさかのぼるいかだくだりでげきりゅうとせいじゃくがこうごにおとずれるじかんをあじわう', 'kumanogawaosakanoboruikadakudaridegekiryuutoseijakugakougoniotozurerujikanoajiwau', 'HARD', 47),
  ('南部梅林の丘で満開の白い花が風に揺れ梅の香りが一面に広がる', 'みなべばいりんのおかでまんかいのしろいはながかぜにゆれうめのかおりがいちめんにひろがる', 'minabebairinnookademankainoshiroihanagakazeniyureumenokaorigaichimennihirogaru', 'HARD', 43),
  ('潮岬の断崖で砕ける波しぶきが虹を描きながら空へ舞い上がる', 'しおのみさきのだんがいでくだけるなみしぶきがにじをえがきながらそらへまいあがる', 'shionomisakinodangaidekudakerunamishibukiganijioegakinagarasorahemaiagaru', 'HARD', 39),
  ('古座川の清流が磨いた巨石の迷宮をかすかな光が照らし出す', 'こざがわのせいりゅうがみがいたきょせきのめいきゅうをかすかなひかりがてらしだす', 'kozagawanoseiryuugamigaitakyosekinomeikyuuokasukanahikarigaterashidasu', 'HARD', 39),
  ('山間の棚田で星明かりを映した水面が夜の静寂にきらめいていた', 'やまあいのたなだでほしあかりをうつしたみなもがよるのせいじゃくにきらめいていた', 'yamaainotanadadehoshiakarioutsushitaminamogayorunoseijakunikirameiteita', 'HARD', 39),
  ('由良の港で熟練の船大工が鉋の音を響かせ木船を仕上げていく', 'ゆらのみなとでじゅくれんのふなだいくがかんなのおとをひびかせきぶねをしあげていく', 'yuranominatodejukurennofunadaikugakannanootoohibikasekibuneoshiageteiku', 'HARD', 40),
  ('熊野本宮大社の大斎原で吹く風が参拝者の衣を揺らし祈りを運ぶ', 'くまのほんぐうたいしゃのおおゆのはらでふくかぜがさんぱいしゃのころもをゆらしいのりをはこぶ', 'kumanohonguutaishanoooyunoharadefukukazegasanpaishanokoromooyurashiinoriohakobu', 'HARD', 45),
  ('龍神村の渓谷に立ち込める蒸気が源泉の力強さを物語っている', 'りゅうじんむらのけいこくにたちこめるじょうきがげんせんのちからづよさをものがたっている', 'ryuujinmuranokeikokunitachikomerujoukigagensennochikarazuyosaomonogatatteiru', 'HARD', 43),
  ('潮騒が響く砂州で夜光虫が波を縁取る幻想的な光景を体験する', 'しおさいがひびくさすでやこうちゅうがなみをふちどるげんそうてきなこうけいをたいけんする', 'shiosaigahibikusasudeyakouchuuganamiofuchidorugensoutekinakoukeiotaikensuru', 'HARD', 43),
  ('冬の大台ヶ原で霧氷が樹々を覆い白銀の世界が静かに広がる', 'ふゆのおおだいがはらできりひょうがきぎをおおいはくぎんのせかいがしずかにひろがる', 'fuyunooodaigaharadekirihyougakigioooihakuginnosekaigashizukanihirogaru', 'HARD', 40),
  ('熊野速玉大社の神楽殿で響く太鼓が夜祭の高揚感を呼び覚ます', 'くまのはやたまだいしゃのかぐらでんでひびくたいこがよまつりのこうようかんをよびさます', 'kumanohayatamadaishanokaguradendehibikutaikogayomatsurinokouyoukanoyobisamasu', 'HARD', 42),
  ('紀ノ川の扇状地を潤す用水路が田畑を巡り豊かな実りを支える', 'きのかわのおうせんじょうちをうるおすようすいろがたはたをめぐりゆたかなみのりをささえる', 'kinokawanoousenjouchiouruosuyousuirogatahataomeguriyutakanaminoriosasaeru', 'HARD', 43),
  ('熊野浦の磯で夜通し焚かれる篝火が航路を示し漁師を導いてきた', 'くまのうらのいそでよどしたかれるかがりびがこうろをしめしりょうしをみちびいてきた', 'kumanouranoisodeyodoshitakarerukagaribigakourooshimeshiryoushiomichibiitekita', 'HARD', 40),
  ('満天の星が降る龍神温泉で川霧が湯気と交じり幻想の夜を彩る', 'まんてんのほしがふるりゅうじんおんせんでかわぎりがゆげとまじりげんそうのよるをいろどる', 'mantennohoshigafururyuujinonsendekawagirigayugetomajirigensounoyoruoirodoru', 'HARD', 43),
  -- SCORE
  ('黄昏の港で漁火が水面を照らす', 'たそがれのみなとでいさりびがみなもをてらす', 'tasogarenominatodeisaribigaminamooterasu', 'SCORE', 21),
  ('朝霧の棚田で水面が銀色に揺れる', 'あさぎりのたなだでみなもがぎんいろにゆれる', 'asagirinotanadademinamogaginironiyureru', 'SCORE', 21),
  ('月明かりの石畳で足音が静かに響く', 'つきあかりのいしだたみであしおとがしずかにひびく', 'tsukiakarinoishidatamideashiotogashizukanihibiku', 'SCORE', 24),
  ('風待ちの丘で帆船が空を見上げる', 'かぜまちのおかではんせんがそらをみあげる', 'kazemachinookadehansengasoraomiageru', 'SCORE', 20),
  ('雨上がりの商店街で提灯が光を宿す', 'あめあがりのしょうてんがいでちょうちんがひかりをやどす', 'ameagarinoshoutengaidechouchingahikarioyadosu', 'SCORE', 27),
  ('深緑の峡谷で川霧がゆっくりと立ち上る', 'しんりょくのきょうこくでかわぎりがゆっくりとたちのぼる', 'shinryokunokyoukokudekawagirigayukkuritotachinoboru', 'SCORE', 27),
  ('星降る展望台で街灯りが遠く瞬く', 'ほしふるてんぼうだいでまちあかりがとおくまたたく', 'hoshifurutenboudaidemachiakarigatookumatataku', 'SCORE', 24),
  ('夕暮れの温泉街で湯気が通りを包む', 'ゆうぐれのおんせんがいでゆげがとおりをつつむ', 'yuugurenoonsengaideyugegatooriotsutsumu', 'SCORE', 22),
  ('朝焼けの漁港で甲板が琥珀色に染まる', 'あさやけのぎょこうでかんぱんがこはくいろにそまる', 'asayakenogyokoudekanpangakohakuironisomaru', 'SCORE', 24),
  ('雪解けの渓流で小石が転がり歌う', 'ゆきどけのけいりゅうでこいしがころがりうたう', 'yukidokenokeiryuudekoishigakorogariutau', 'SCORE', 22),
  ('秋晴れの梅林で香りが風に溶ける', 'あきばれのばいりんでかおりがかぜにとける', 'akibarenobairindekaorigakazenitokeru', 'SCORE', 20),
  ('真夜中の図書館で頁が静かにめくれる', 'まよなかのとしょかんでぺーじがしずかにめくれる', 'mayonakanotoshokandepeejigashizukanimekureru', 'SCORE', 23),
  ('夏祭りの橋で太鼓が胸を震わせる', 'なつまつりのはしでたいこがむねをふるわせる', 'natsumatsurinohashidetaikogamuneofuruwaseru', 'SCORE', 21),
  ('緑陰の遊歩道で木漏れ日が揺れ続ける', 'りょくいんのゆうほどうでこもれびがゆれつづける', 'ryokuinnoyuuhodoudekomorebigayuretsuzukeru', 'SCORE', 23),
  ('春霞の古城で燕が石壁をかすめる', 'はるがすみのこじょうでつばめがせきへきをかすめる', 'harugasuminokojoudetsubamegasekihekiokasumeru', 'SCORE', 24),
  ('朧月の庭園で灯籠が池面に揺らぐ', 'おぼろづきのていえんでとうろうがちめんにゆらぐ', 'oborozukinoteiendetourougachimenniyuragu', 'SCORE', 23),
  ('霜夜の広場で吐息が白く弾む', 'しもよのひろばでといきがしろくはずむ', 'shimoyonohirobadetoikigashirokuhazumu', 'SCORE', 18),
  ('初夏の露天風呂で星座が湯面を照らす', 'しょかのろてんぶろでせいざがゆめんをてらす', 'shokanorotenburodeseizagayumenoterasu', 'SCORE', 21),
  ('夕立の停留所で雨音が鼓動と重なる', 'ゆうだちのていりゅうじょであまおとがこどうとかさなる', 'yuudachinoteiryuujodeamaotogakodoutokasanaru', 'SCORE', 26),
  ('早朝の市場で威勢の掛け声が飛び交う', 'そうちょうのいちばでいせいのかけごえがとびかう', 'souchounoichibadeiseinokakegoegatobikau', 'SCORE', 23),
  ('木枯らしの路地で暖簾がくるりと舞う', 'こがらしのろじでのれんがくるりとまう', 'kogarashinorojidenorengakururitomau', 'SCORE', 18),
  ('曇天の灯台で鈴が潮騒に混ざる', 'どんてんのとうだいですずがしおさいにまざる', 'dontennotoudaidesuzugashiosainimazaru', 'SCORE', 21),
  ('初雪の神社で足跡が参道を彩る', 'はつゆきのじんじゃであしあとがさんどうをいろどる', 'hatsuyukinojinjadeashiatogasandouoirodoru', 'SCORE', 24),
  ('真昼の堤防で潮目が虹色に揺らぐ', 'まひるのていぼうでしおめがにじいろにゆらぐ', 'mahirunoteiboudeshiomeganijiironiyuragu', 'SCORE', 21),
  ('碧空の牧場で風車が静かに回る', 'へきくうのぼくじょうでふうしゃがしずかにまわる', 'hekikuunobokujoudefuushagashizukanimawaru', 'SCORE', 23),
  ('月光の水田で稲穂がさざ波を描く', 'げっこうのすいでんでいなほがさざなみをえがく', 'gekkounosuidendeinahogasazanamioegaku', 'SCORE', 22),
  ('春雨の歌碑で句読点が濡れて光る', 'はるさめのかひでくとうてんがぬれてひかる', 'harusamenokahidekutoutenganuretehikaru', 'SCORE', 20),
  ('朝露の竹林で小鳥が音色を紡ぐ', 'あさつゆのちくりんでことりがねいろをつむぐ', 'asatsuyunochikurindekotoriganeirootsumugu', 'SCORE', 21),
  ('凪いだ入江で帆影が鏡のように重なる', 'ないだいりえではかげがかがみのようにかさなる', 'naidairiedehakagegakagaminoyounikasanaru', 'SCORE', 22),
  ('夜明けの温室で花弁が順に開く', 'よあけのおんしつでかべんがじゅんにひらく', 'yoakenoonshitsudekabengajunnihiraku', 'SCORE', 20),
  ('暁の峠で雲海が谷をゆっくり満たす', 'あかつきのとうげでうんかいがたにをゆっくりみたす', 'akatsukinotougedeunkaigatanioyukkurimitasu', 'SCORE', 24),
  ('青藍の湖畔で風紋が砂を撫でる', 'せいらんのこはんでふうもんがすなをなでる', 'seirannokohandefuumongasunaonaderu', 'SCORE', 20),
  ('茜雲の岬で潮騒が胸に響く', 'あかねぐものみさきでしおさいがむねにひびく', 'akanegumonomisakideshiosaigamunenihibiku', 'SCORE', 21),
  ('梢の駅舎で列車の灯りが滲む', 'こずえのえきしゃでれっしゃのあかりがにじむ', 'kozuenoekishaderesshanoakariganijimu', 'SCORE', 21),
  ('潮騒の堤で波飛沫が頬をかすめる', 'しおさいのつつみでなみしぶきがほほをかすめる', 'shiosainotsutsumidenamishibukigahohookasumeru', 'SCORE', 22),
  ('朝靄の吊橋で板が柔らかくしなる', 'あさもやのつりばしでいたがやわらかくしなる', 'asamoyanotsuribashideitagayawarakakushinaru', 'SCORE', 21),
  ('月虹の滝壺で水煙が光を放つ', 'げっこうのたきつぼでみずけむりがひかりをはなつ', 'gekkounotakitsubodemizukemurigahikariohanatsu', 'SCORE', 23),
  ('南風の岬道で草花が肩を叩く', 'みなみかぜのみさきみちでくさばながかたをたたく', 'minamikazenomisakimichidekusabanagakataotataku', 'SCORE', 23),
  ('夕陽の湖面で白鳥が弧を描く', 'ゆうひのこめんではくちょうがこをえがく', 'yuuhinokomendehakuchougakooegaku', 'SCORE', 19),
  ('木漏れ日の寺院で鐘が遠く響く', 'こもれびのじいんでかねがとおくひびく', 'komorebinojiindekanegatookuhibiku', 'SCORE', 18),
  ('夜更けの製茶場で香りが胸を包む', 'よふけのせいちゃじょうでかおりがむねをつつむ', 'yofukenoseichajoudekaorigamuneotsutsumu', 'SCORE', 20),
  ('真夏の縁側で風鈴が時を告げる', 'まなつのえんがわでふうりんがときをつげる', 'manatsunoengawadefuuringatokiotsugeru', 'SCORE', 19),
  ('早春の灯籠で蝋が静かに垂れる', 'そうしゅんのとうろうでろうがしずかにたれる', 'soushunnotourouderougashizukanitareru', 'SCORE', 21),
  ('薄暮の遊園地で観覧車が星を運ぶ', 'はくぼのゆうえんちでかんらんしゃがほしをはこぶ', 'hakubonoyuuenchidekanranshagahoshiwohakobu', 'SCORE', 24),
  ('霧雨の公園で傘先が光を零す', 'きりさめのこうえんでかささきがひかりをこぼす', 'kirisamenokouendekasasakigahikariwokobosu', 'SCORE', 23),
  ('白南風の防波堤で波紋が足元を洗う', 'しらはえのぼうはていではもんがあしもとをあらう', 'shirahaenobouhateidehamongashimotoowarau', 'SCORE', 24),
  ('夕闇の堀端で鯉が水面を割る', 'ゆうやみのほりばたでこいがみなもをわる', 'yuuyaminohoribatadekoigaminamowowaru', 'SCORE', 20),
  ('朝凪の船着き場で綱が鳴る', 'あさなぎのふなつきばでつながなる', 'asanaginofunatsukibadetsunaganaru', 'SCORE', 18),
  ('青緑の峡谷で響きが幾重にも返る', 'あおみどりのきょうこくでひびきがいくえにもかえる', 'aomidorinokyoukokudehibikigaikuenimokaeru', 'SCORE', 24),
  ('夜風の屋台で提灯が揺れて笑う', 'よかぜのやたいでちょうちんがゆれてわらう', 'yokazenoyataidechouchingayuretewarau', 'SCORE', 21),
  ('暮れなずむ稜線で鳥影が空を渡る', 'くれなずむりょうせんでとりかげがそらをわたる', 'kurenazumurousendetorikagegasorawowataru', 'SCORE', 22),
  ('山間の稲架場で穂束が香り立つ', 'やまあいのはさばでほたばがかおりたつ', 'yamaainohasabadehotabagakaoritatsu', 'SCORE', 18),
  ('真昼の果樹園で陽射しが葉を透かす', 'まひるのかじゅえんでひざしがはをすかす', 'mahirunokajuuendehizashigahaosukasu', 'SCORE', 21),
  ('朔夜の城壁で松明が影を踊らせる', 'さくやのじょうへきでたいまつがかげをおどらせる', 'sakuyanojouhekidetaimatsugakagewoodoraseru', 'SCORE', 24),
  ('花霞の河川敷で弦が柔らかく響く', 'はながすみのかせんじきでげんがやわらかくひびく', 'hanagasuminokasenjikidegengayawarakakuhibiku', 'SCORE', 23),
  ('台風前の港で錨鎖が低く唸る', 'たいふうまえのみなとでいかりぐさがひくくうなる', 'taifuumaenominatodeikarigusagahikukuunaru', 'SCORE', 21),
  ('霜晴れの原野で足音が澄んで響く', 'しもばれのげんやであしおとがすんでひびく', 'shimobarenogenyadeashiotogasundehibiku', 'SCORE', 19),
  ('宵闇の水路で小舟が灯りを揺らす', 'よいやみのすいろでこぶねがあかりをゆらす', 'yoiyaminosuorodekobunegaakariwoyurasu', 'SCORE', 20),
  ('木曽の峠道で霧笛が胸を震わせる', 'きそのとうげみちでむてきがむねをふるわせる', 'kisonotougemichidemutekigamuneofuruwaseru', 'SCORE', 23),
  ('朝凪の湖心で櫂が波紋を描く', 'あさなぎのこしんでかいがはもんをえがく', 'asanaginokoshindekaigahamonwoegaku', 'SCORE', 18),
  ('夕凪の小舟で琴の音が渡る', 'ゆうなぎのこぶねできんのおとがわたる', 'yuunaginokobunedekinnootogawataru', 'SCORE', 17),
  ('山里の窯場で火花が闇を照らす', 'やまざとのかまばでひばながやみをてらす', 'yamazatonokamabadehibanagayamiwoterasu', 'SCORE', 19),
  ('夏雲の堤で蝉時雨が降り注ぐ', 'なつぐものつつみでせみしぐれがふりそそぐ', 'natsugumonotsutsumidesemishiguregafurisosogu', 'SCORE', 22),
  ('月白の野道で露草が光を帯びる', 'げっぱくののみちでつゆくさがひかりをおびる', 'geppakunonomichidetsuyukusagahikariwoobiru', 'SCORE', 20),
  ('霧立つ高速で車列の灯が滲む', 'きりたつこうそくでしゃれつのひがにじむ', 'kiritatsukousokudesharetsunohiganijimu', 'SCORE', 20),
  ('秋雨の書店で頁が雨粒を弾く', 'あきさめのしょてんでぺーじがあまつぶをはじく', 'akisamenoshotendipeejigaamatsubuohajiku', 'SCORE', 22),
  ('夜明けの桟橋で風が帆柱を揺らす', 'よあけのさんばしでかぜがほばしらをゆらす', 'yoakenosanbashidekazegahobashiraoyurasu', 'SCORE', 21),
  ('初秋の峠茶屋で湯気が軒を染める', 'しょしゅうのとうげちゃやでゆげがのきをそめる', 'shoshunonougechayadeyugeganokiosomeru', 'SCORE', 21),
  ('雪明かりの路地で狐火が揺らめく', 'ゆきあかりのろじできつねびがゆらめく', 'yukiakarinorojidekitsunebigayurameku', 'SCORE', 21),
  ('朝霜の菜畑で息が真珠のように光る', 'あさしものなばたけでいきがしんじゅのようにひかる', 'asashimononabatakedeikigashinjunoyounihikaru', 'SCORE', 24),
  ('長雨の庭石で苔が静かに広がる', 'ながあめのにわいしでこけがしずかにひろがる', 'nagaamenoniwaishidekokegashizukanihirogaru', 'SCORE', 21),
  ('旋風の灯下で暖簾が踊り続ける', 'つむじかぜのとうかでのれんがおどりつづける', 'tsumujikazenotoukadenorengaodoritsudukeru', 'SCORE', 22),
  ('夕映えの丘陵で影が長く伸びる', 'ゆうばえのきゅうりょうでかげがながくのびる', 'yuubaenokyuuryoudekageganagakunobiru', 'SCORE', 20),
  ('潮風のキャンバスで絵具が瞬時に乾く', 'しおかぜのきゃんばすでえのぐがしゅんじにかわく', 'shiokazenokyanbasudeenogushunjinikawaku', 'SCORE', 23),
  ('春風の港町で旗が碧空に弧を描く', 'はるかぜのみなとまちではたがへきくうにこをえがく', 'harukazenominatomachidehatagahekikuunikooegaku', 'SCORE', 23),
  ('月夜の桜堤で花影が水面を撫でる', 'つきよのさくらづつみではなかげがみなもをなでる', 'tsukiyonosakurazutsumidehanakagegaminamoonaderu', 'SCORE', 24),
  ('朝焼けの展望塔で街並みが紅に染まる', 'あさやけのてんぼうとうでまちなみがくれないにそまる', 'asayakenotenboutoudemachinamigakurenainisomaru', 'SCORE', 25),
  ('霧深い温泉郷で湯煙が道標を隠す', 'きりぶかいおんせんきょうでゆけむりがみちしるべをかくす', 'kiribukaionsenkyoudeyukemurigamichishirubeokakusu', 'SCORE', 26),
  ('雷鳴の峠茶屋で暖炉が心地よく唸る', 'らいめいのとうげちゃやでだんろがここちよくうなる', 'raimeinotougechayadedanrogakokochiyokuunaru', 'SCORE', 24),
  ('陽炎の停車場で線路がゆらりと揺れる', 'かげろうのていしゃじょうでせんろがゆらりとゆれる', 'kagerounoteishajoudesenrogayararitoyureru', 'SCORE', 24),
  ('深夜の製麺所で粉が静かに舞い上がる', 'しんやのせいめんじょでこながしずかにまいあがる', 'shinyanoseimenjodekonagashizukanimaiagaru', 'SCORE', 23),
  ('朝霞の干潟で潮鳥が跳ね回る', 'あさがすみのひがたでしおどりがはねまわる', 'asagasuminohigatadeshiodorigahanemawaru', 'SCORE', 20),
  ('星明かりの露台で麦酒が金色に泡立つ', 'ほしあかりのろだいでびーるがきんいろにあわだつ', 'hoshiakarinorodaidebiirugakinironiawadatsu', 'SCORE', 23),
  ('薄明の客船で汽笛が港を呼ぶ', 'はくめいのきゃくせんできてきがみなとをよぶ', 'hakumeinokyakusendekitekigaminatowoyobu', 'SCORE', 21),
  ('砂紋の海岸で帆影が揺り戻る', 'さもんのかいがんではかげがゆりもどる', 'samonnokaigandehakagegayurimodoru', 'SCORE', 18),
  ('春雷の田園で稲苗が震えながら煌く', 'しゅんらいのでんえんでいななえがふるえながらきらめく', 'shunrainodenendeinanaegafuruenagarakirameku', 'SCORE', 26),
  ('夜半の資料館で時計が粛々と刻む', 'やはんのしりょうかんでとけいがしゅくしゅくときざむ', 'yahannoshiryoukandetokeigashukushukutokizamu', 'SCORE', 25),
  ('夕虹の渓谷で霧粒が宝石のように光る', 'ゆうにじのけいこくできりつぶがほうせきのようにひかる', 'yuunijinokeikokudekiritsubugahousekinoyounihikaru', 'SCORE', 26),
  ('晴天の古民家で茅葺が陽を浴びる', 'せいてんのこみんかでかやぶきがひをあびる', 'seitennokominkadekayabukigahioabiru', 'SCORE', 20),
  ('霜夜の灯台で旋梯が軋みを奏でる', 'しもよのとうだいでせんていがきしみをかなでる', 'shimoyonotoudaidesenteigakishimiokanaderu', 'SCORE', 22),
  ('曙の湖畔で鴎が静かに輪を描く', 'あけぼののこはんでかもめがしずかにわをえがく', 'akebononokohandekamomegashizukaniwaoegaku', 'SCORE', 22),
  ('星空の宿場で囲炉裏が赤く脈打つ', 'ほしぞらのしゅくばでいろりがあかくみゃくうつ', 'hoshizoranoshukubadeirorigaakakumyakuutsu', 'SCORE', 22),
  ('夕凪の海城で堀水が音もなく満ちる', 'ゆうなぎのかいじょうでほりみずがおともなくみちる', 'yuunaginokaijoudehorimizugaotomonakumichiru', 'SCORE', 24),
  ('霧吹く高原で放牧馬が鼻息を白くする', 'きりふくこうげんでほうぼくばがはないきをしろくする', 'kirifukukougendehoubokubagahanaikioshirokusuru', 'SCORE', 25),
  ('朝霧の棚橋で欄干が露を纏う', 'あさぎりのたなばしでらんかんがつゆをまとう', 'asagirinotanabashiderankangatsuyuomatou', 'SCORE', 21),
  ('芒種の田園で水車が低く歌う', 'ぼうしゅのでんえんですいしゃがひくくうたう', 'boushunodenendesuishagahikukuutau', 'SCORE', 21),
  ('長月の夜市で笙が柔らかく響く', 'ながつきのよいちでしょうがやわらかくひびく', 'nagatsukinoyoichideshougayawarakakuhibiku', 'SCORE', 21),
  ('白露の駅前で吐息が街灯を霞ませる', 'はくろのえきまえでといきががいとうをかすませる', 'hakuronoekimaedetoikigagaitouokasumaseru', 'SCORE', 23),
  ('春宵の庭園で琴線が静かに揺れる', 'しゅんしょうのていえんできんせんがしずかにゆれる', 'shunshounoteiendekinsengashizukaniyureru', 'SCORE', 24),
  ('冬晴れの堤で雪解け水が緩やかに流れる', 'ふゆばれのつつみでゆきどけみずがゆるやかにながれる', 'fuyubarenotsutsumideyukidokemizugayuruyakaninagareru', 'SCORE', 25)
on conflict (text, difficulty) do nothing;
