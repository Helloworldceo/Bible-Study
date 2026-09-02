// Word banks for the Wordle-style puzzle. Kept to single words (no spaces,
// no numeric prefixes) since the letter grid can't represent those --
// "1 Corinthians" becomes just "CORINTHIANS", which still reads as a real
// Bible book family for puzzle purposes.
export const BOOK_WORDS: string[] = [
  'GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY', 'JOSHUA',
  'JUDGES', 'RUTH', 'SAMUEL', 'KINGS', 'CHRONICLES', 'EZRA', 'NEHEMIAH',
  'ESTHER', 'JOB', 'PSALMS', 'PROVERBS', 'ECCLESIASTES', 'ISAIAH',
  'JEREMIAH', 'LAMENTATIONS', 'EZEKIEL', 'DANIEL', 'HOSEA', 'JOEL', 'AMOS',
  'OBADIAH', 'JONAH', 'MICAH', 'NAHUM', 'HABAKKUK', 'ZEPHANIAH', 'HAGGAI',
  'ZECHARIAH', 'MALACHI', 'MATTHEW', 'MARK', 'LUKE', 'JOHN', 'ACTS',
  'ROMANS', 'CORINTHIANS', 'GALATIANS', 'EPHESIANS', 'PHILIPPIANS',
  'COLOSSIANS', 'THESSALONIANS', 'TIMOTHY', 'TITUS', 'PHILEMON', 'HEBREWS',
  'JAMES', 'PETER', 'JUDE', 'REVELATION',
];

export const NAME_WORDS: string[] = [
  'ADAM', 'EVE', 'NOAH', 'ABRAHAM', 'SARAH', 'ISAAC', 'REBEKAH', 'JACOB',
  'ESAU', 'RACHEL', 'LEAH', 'JOSEPH', 'MOSES', 'AARON', 'MIRIAM', 'JOSHUA',
  'RUTH', 'NAOMI', 'SAMUEL', 'SAUL', 'DAVID', 'SOLOMON', 'ELIJAH', 'ELISHA',
  'ISAIAH', 'JEREMIAH', 'DANIEL', 'ESTHER', 'MORDECAI', 'JOB', 'JONAH',
  'MARY', 'ELIZABETH', 'ZECHARIAH', 'JOHN', 'PETER', 'ANDREW', 'PHILIP',
  'THOMAS', 'MATTHEW', 'NICODEMUS', 'LAZARUS', 'MARTHA', 'STEPHEN', 'PAUL',
  'BARNABAS', 'TIMOTHY', 'PRISCILLA', 'SILAS', 'CORNELIUS', 'NATHAN',
  'GIDEON', 'DEBORAH', 'SAMSON', 'DELILAH',
];

export interface VersePuzzle {
  templateEn: string;
  templateAm: string;
  answer: string;
  reference: string;
}

// The blank in each template is where the guessed word belongs -- shown to
// the player before they guess (unlike Books/Names, a verse fill-in-blank
// is unplayable without the surrounding context).
export const VERSE_PUZZLES: VersePuzzle[] = [
  {
    templateEn: 'For God so loved the world, that he gave his only begotten _____, that whosoever believeth in him should not perish, but have everlasting life.',
    templateAm: 'በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት እንዲኖረው እንጂ እንዳይጠፋ እግዚአብሔር አንድያ _____ እስኪሰጥ ድረስ ዓለሙን እንዲሁ ወዶአልና።',
    answer: 'SON',
    reference: 'John 3:16',
  },
  {
    templateEn: 'The LORD is my _____; I shall not want.',
    templateAm: 'እግዚአብሔር _____ ነው፥ የሚያሳጣኝም የለም።',
    answer: 'SHEPHERD',
    reference: 'Psalm 23:1',
  },
  {
    templateEn: 'Trust in the LORD with all thine _____; and lean not unto thine own understanding.',
    templateAm: 'በፍጹም _____ በእግዚአብሔር ታመን፥ በራስህም ማስተዋል አትደገፍ።',
    answer: 'HEART',
    reference: 'Proverbs 3:5',
  },
  {
    templateEn: 'Be still, and know that I am _____.',
    templateAm: 'ጸጥ በሉ እኔም _____ እንደሆንሁ እወቁ።',
    answer: 'GOD',
    reference: 'Psalm 46:10',
  },
  {
    templateEn: 'And we know that all things work together for _____ to them that love God.',
    templateAm: 'እግዚአብሔርንም ለሚወዱት ሁሉ ነገር ለ_____ እንዲደረግ እናውቃለን።',
    answer: 'GOOD',
    reference: 'Romans 8:28',
  },
  {
    templateEn: 'In the beginning was the _____, and the Word was with God.',
    templateAm: 'በመጀመሪያ _____ ነበረ፤ ቃልም በእግዚአብሔር ዘንድ ነበረ።',
    answer: 'WORD',
    reference: 'John 1:1',
  },
  {
    templateEn: 'And God said, Let there be _____: and there was light.',
    templateAm: 'እግዚአብሔርም። _____ ይሁን አለ፤ ብርሃንም ሆነ።',
    answer: 'LIGHT',
    reference: 'Genesis 1:3',
  },
  {
    templateEn: 'Love your _____, bless them that curse you.',
    templateAm: '_____ን ውደዱ፥ የሚረግሟችሁንም መርቁ።',
    answer: 'ENEMIES',
    reference: 'Matthew 5:44',
  },
  {
    templateEn: 'The joy of the LORD is your _____.',
    templateAm: 'የእግዚአብሔር ደስታ _____ ናት።',
    answer: 'STRENGTH',
    reference: 'Nehemiah 8:10',
  },
  {
    templateEn: 'Be strong and of good _____; be not afraid.',
    templateAm: 'በርታና _____ ሁን፤ አትፍራ።',
    answer: 'COURAGE',
    reference: 'Joshua 1:9',
  },
  {
    templateEn: 'Create in me a _____ heart, O God.',
    templateAm: 'አቤቱ የ_____ ልብን በእኔ ውስጥ ፍጠር።',
    answer: 'CLEAN',
    reference: 'Psalm 51:10',
  },
  {
    templateEn: 'Thy word is a lamp unto my feet, and a light unto my _____.',
    templateAm: 'ቃልህ ለእግሬ መብራት፥ ለ_____ ብርሃን ነው።',
    answer: 'PATH',
    reference: 'Psalm 119:105',
  },
  {
    templateEn: 'Blessed are the _____: for they shall obtain mercy.',
    templateAm: 'የ_____ ብፁዓን ናቸው፥ ምሕረትን ያገኛሉና።',
    answer: 'MERCIFUL',
    reference: 'Matthew 5:7',
  },
  {
    templateEn: 'Greater love hath no man than this, that a man lay down his life for his _____.',
    templateAm: 'ስለ _____ ነፍሱን ከመስጠት ይልቅ ከዚህ የሚበልጥ ፍቅር ለማንም የለውም።',
    answer: 'FRIENDS',
    reference: 'John 15:13',
  },
  {
    templateEn: 'There is no fear in love; but perfect love casteth out _____.',
    templateAm: 'ፍጹም ፍቅር _____ን አውጥቶ ይጥላል እንጂ በፍቅር ፍርሃት የለም።',
    answer: 'FEAR',
    reference: '1 John 4:18',
  },
  {
    templateEn: 'But they that wait upon the LORD shall renew their strength; they shall mount up with _____ as eagles.',
    templateAm: 'እግዚአብሔርን በተስፋ የሚጠባበቁ ግን ኃይላቸውን ያድሳሉ፤ እንደ ንስር _____ ይወጣሉ።',
    answer: 'WINGS',
    reference: 'Isaiah 40:31',
  },
];
