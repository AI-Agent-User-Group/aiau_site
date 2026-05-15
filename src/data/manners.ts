type LinkedItem = {
  prefix: string;
  href: string;
  label: string;
  suffix: string;
};

type EventFlowStep = {
  number: string;
  icon: string;
  title: string;
  items: string[];
  linkedItem?: LinkedItem;
};

export const preVisitChecks = [
  '体調は良好（体調不良時は無理せず参加見合わせ）',
  '受付方法・開始時刻の確認（Connpass/Lumaなど）',
  'ノートPC/充電器/モバイルバッテリー/イヤホン（必要な方）',
  '撮影・SNS方針を確認（下部の関連リンクを参照）',
] as const;

export const eventFlowSteps: EventFlowStep[] = [
  {
    number: '1',
    icon: 'fa-door-open',
    title: '受付〜入室',
    items: ['受付列は静かに待機', '荷物は足元や荷物置きへ', '通路・出入口はふさがない'],
  },
  {
    number: '2',
    icon: 'fa-chalkboard-user',
    title: 'セッション中',
    items: ['通知オフ、私語・通話は控えめに', '質問は簡潔に1つずつ'],
    linkedItem: {
      prefix: '発表の妨害はしない（',
      href: '/code-of-conduct',
      label: '規範',
      suffix: '）',
    },
  },
  {
    number: '3',
    icon: 'fa-road',
    title: '移動・休憩',
    items: ['通路・避難口は常に確保', '席移動は休憩時間に'],
  },
  {
    number: '4',
    icon: 'fa-camera',
    title: '写真・SNS',
    items: ['個人が写る写真はOKをもらってから', '撮影NGの表示は守る'],
    linkedItem: {
      prefix: '個人情報は写さない（',
      href: '/privacy-policy',
      label: 'PP',
      suffix: '）',
    },
  },
  {
    number: '5',
    icon: 'fa-people-arrows',
    title: '交流タイム',
    items: ['名刺・SNS交換は相手のOKをもらってから', '距離感を大切に', '場と時間を選んで交流'],
  },
  {
    number: '6',
    icon: 'fa-utensils',
    title: '飲食・その他',
    items: ['飲食はほどほどに。泥酔はNG', 'ゴミは分別して処分', '貴重品は自分で管理'],
  },
];

export const harassmentExamples = [
  {
    title: '見た目や属性で判断されたり、傷つく言葉',
    description: '性別、外見、国籍、年齢などを理由にした心ない発言や扱い',
  },
  {
    title: '怖い・威圧的な態度や言動',
    description: '脅すような態度、人格を否定する言葉、勝手に体に触れる',
  },
  {
    title: '不快な発言や、しつこい連絡先の交換',
    description: '性的な話題、相手が嫌がっているのに連絡先を聞き続ける',
  },
  {
    title: '勝手な撮影や、個人情報の公開',
    description: '許可なく写真・動画を撮る、SNSで個人情報を晒す、つきまとい',
  },
  {
    title: '発表を邪魔したり、場にふさわしくない行為',
    description: '学習の妨げになる行為、不適切な内容の投稿、出会い目的の行動',
  },
] as const;
