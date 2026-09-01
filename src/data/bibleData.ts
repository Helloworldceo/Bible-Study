import { BibleBook, BibleVerse, ChapterContent } from '../types';
import { StorageManager } from '../utils/offlineStorage';

export const BIBLE_BOOKS: BibleBook[] = [
  // OLD TESTAMENT (ብሉይ ኪዳን / Ancien Testament)
  // Law / Pentateuch
  { id: 'GEN', nameEn: 'Genesis', nameAm: 'ኦሪት ዘፍጥረት', nameFr: 'Genèse', testament: 'OT', category: 'law', chaptersCount: 50, descriptionEn: 'Creation, the Fall, and the Patriarchs', descriptionAm: 'ፍጥረት፣ የሰው ልጅ መውደቅ እና የአባቶች ታሪክ', descriptionFr: 'Création, la Chute et les Patriarches' },
  { id: 'EXO', nameEn: 'Exodus', nameAm: 'ኦሪት ዘጸአት', nameFr: 'Exode', testament: 'OT', category: 'law', chaptersCount: 40, descriptionEn: 'Deliverance from Egypt and the Ten Commandments', descriptionAm: 'ከግብፅ ባርነት መውጣት እና አሥሩ ትእዛዛት', descriptionFr: 'Délivrance d\'Égypte et les Dix Commandements' },
  { id: 'LEV', nameEn: 'Leviticus', nameAm: 'ኦሪት ዘሌዋውያን', nameFr: 'Lévitique', testament: 'OT', category: 'law', chaptersCount: 27, descriptionEn: 'Holiness, worship, and priesthood', descriptionAm: 'ቅድስና፣ አምልኮ እና የክህነት ሥርዓት', descriptionFr: 'Sainteté, culte et sacerdoce' },
  { id: 'NUM', nameEn: 'Numbers', nameAm: 'ኦሪት ዘኍልቍ', nameFr: 'Nombres', testament: 'OT', category: 'law', chaptersCount: 36, descriptionEn: 'Wilderness wanderings and census', descriptionAm: 'የምድረ በዳ ጉዞ እና የሕዝብ ቍጥር', descriptionFr: 'Marche au désert et recensements' },
  { id: 'DEU', nameEn: 'Deuteronomy', nameAm: 'ኦሪት ዘዳግም', nameFr: 'Deutéronome', testament: 'OT', category: 'law', chaptersCount: 34, descriptionEn: 'Moses\' final exhortation and covenant renewal', descriptionAm: 'የሕግ መደገም እና የቃል ኪዳን መታደስ', descriptionFr: 'Dernière exhortation de Moïse et renouvellement de l\'alliance' },

  // History
  { id: 'JOS', nameEn: 'Joshua', nameAm: 'መጽሐፈ ኢያሱ', nameFr: 'Josué', testament: 'OT', category: 'history', chaptersCount: 24, descriptionEn: 'Conquest and settlement in the Promised Land', descriptionAm: 'የተስፋይቱ ምድር ወረራ እና ርስት መከፋፈል', descriptionFr: 'Conquête et partage de la Terre Promise' },
  { id: 'JDG', nameEn: 'Judges', nameAm: 'መጽሐፈ መሳፍንት', nameFr: 'Juges', testament: 'OT', category: 'history', chaptersCount: 21, descriptionEn: 'Cycles of disobedience and heroic deliverers', descriptionAm: 'የመሳፍንት ዘመን እና የእግዚአብሔር ታዳጊነት', descriptionFr: 'Cycles de désobéissance et libérateurs fidèles' },
  { id: 'RUT', nameEn: 'Ruth', nameAm: 'መጽሐፈ ሩት', nameFr: 'Ruth', testament: 'OT', category: 'history', chaptersCount: 4, descriptionEn: 'Loyalty, redemption, and King David\'s lineage', descriptionAm: 'ታማኝነት፣ ቤዛነት እና የዳዊት የዘር ሐረግ', descriptionFr: 'Fidélité, rachat et lignée de David' },
  { id: '1SA', nameEn: '1 Samuel', nameAm: 'መጽሐፈ ሳሙኤል ቀዳማዊ', nameFr: '1 Samuel', testament: 'OT', category: 'history', chaptersCount: 31, descriptionEn: 'Transition from judges to kings; Saul and David', descriptionAm: 'የንጉሥ ሳኦል እና የዳዊት ታሪክ', descriptionFr: 'Transition vers la royauté, Saül et David' },
  { id: '2SA', nameEn: '2 Samuel', nameAm: 'መጽሐፈ ሳሙኤል ካልዕ', nameFr: '2 Samuel', testament: 'OT', category: 'history', chaptersCount: 24, descriptionEn: 'Reign of King David in Jerusalem', descriptionAm: 'የንጉሥ ዳዊት ንግሥና እና ግዛት', descriptionFr: 'Règne de David à Jérusalem' },
  { id: '1KI', nameEn: '1 Kings', nameAm: 'መጽሐፈ ነገሥት ቀዳማዊ', nameFr: '1 Rois', testament: 'OT', category: 'history', chaptersCount: 22, descriptionEn: 'Solomon\'s wisdom, the Temple, and kingdom division', descriptionAm: 'የሰሎሞን ጥበብ፣ ቤተ መቅደስ እና የመንግሥት መከፈል', descriptionFr: 'Sagesse de Salomon, le Temple et division du royaume' },
  { id: '2KI', nameEn: '2 Kings', nameAm: 'መጽሐፈ ነገሥት ካልዕ', nameFr: '2 Rois', testament: 'OT', category: 'history', chaptersCount: 25, descriptionEn: 'Elijah, Elisha, and the fall of the kingdoms', descriptionAm: 'ኤልያስ፣ ኤልሳዕ እና የኢየሩሳሌም መማረክ', descriptionFr: 'Élie, Élisée et la chute des royaumes' },
  { id: '1CH', nameEn: '1 Chronicles', nameAm: 'መጽሐፈ ዜና መዋዕል ቀዳማዊ', nameFr: '1 Chroniques', testament: 'OT', category: 'history', chaptersCount: 29, descriptionEn: 'Genealogies and David\'s royal worship preparations', descriptionAm: 'የዘር ሐረግ እና የዳዊት አምልኮ ሥርዓት', descriptionFr: 'Généalogies et préparatifs de David pour le culte' },
  { id: '2CH', nameEn: '2 Chronicles', nameAm: 'መጽሐፈ ዜና መዋዕል ካልዕ', nameFr: '2 Chroniques', testament: 'OT', category: 'history', chaptersCount: 36, descriptionEn: 'Solomon\'s temple and the kings of Judah', descriptionAm: 'የይሁዳ ነገሥታት እና መንፈሳዊ መታደስ', descriptionFr: 'Le temple de Salomon et les rois de Juda' },
  { id: 'EZR', nameEn: 'Ezra', nameAm: 'መጽሐፈ ዕዝራ', nameFr: 'Esdras', testament: 'OT', category: 'history', chaptersCount: 10, descriptionEn: 'Return from exile and rebuilding the Temple', descriptionAm: 'ከምርኮ መመለስ እና የቤተ መቅደስ መታነጽ', descriptionFr: 'Retour d\'exil et reconstruction du Temple' },
  { id: 'NEH', nameEn: 'Nehemiah', nameAm: 'መጽሐፈ ነህምያ', nameFr: 'Néhémie', testament: 'OT', category: 'history', chaptersCount: 13, descriptionEn: 'Rebuilding Jerusalem\'s walls in prayer and unity', descriptionAm: 'የኢየሩሳሌም ቅጥር መታደስ እና ጽናት', descriptionFr: 'Reconstruction des murailles de Jérusalem' },
  { id: 'EST', nameEn: 'Esther', nameAm: 'መጽሐፈ አስቴር', nameFr: 'Esther', testament: 'OT', category: 'history', chaptersCount: 10, descriptionEn: 'Providential deliverance of God\'s people', descriptionAm: 'የአስቴር ድፍረት እና የእግዚአብሔር ታዳጊነት', descriptionFr: 'Délivrance providentielle du peuple de Dieu' },

  // Poetry & Wisdom
  { id: 'JOB', nameEn: 'Job', nameAm: 'መጽሐፈ ኢዮብ', nameFr: 'Job', testament: 'OT', category: 'poetry', chaptersCount: 42, descriptionEn: 'Suffering, sovereignty, and trust in God', descriptionAm: 'መከራ፣ የእግዚአብሔር ሉዓላዊነት እና ጽናት', descriptionFr: 'Souffrance, souveraineté et confiance en Dieu' },
  { id: 'PSA', nameEn: 'Psalms', nameAm: 'መዝሙረ ዳዊት', nameFr: 'Psaumes', testament: 'OT', category: 'poetry', chaptersCount: 150, descriptionEn: 'Prayers, praises, and prophetic songs of devotion', descriptionAm: 'የውዳሴ፣ የምስጋና እና የጸሎት መዝሙራት', descriptionFr: 'Prières, louanges et cantiques prophétiques' },
  { id: 'PRO', nameEn: 'Proverbs', nameAm: 'መጽሐፈ ምሳሌ', nameFr: 'Proverbes', testament: 'OT', category: 'poetry', chaptersCount: 31, descriptionEn: 'Practical wisdom for righteous daily living', descriptionAm: 'ለዕለት ተዕለት ኑሮ የሚሆን ጥበብ እና ምክር', descriptionFr: 'Sagesse pratique pour la vie quotidienne' },
  { id: 'ECC', nameEn: 'Ecclesiastes', nameAm: 'መጽሐፈ መክብብ', nameFr: 'Ecclésiaste', testament: 'OT', category: 'poetry', chaptersCount: 12, descriptionEn: 'Meaning of life and fearing God above vanity', descriptionAm: 'የሕይወት ትርጉም እና ፈሪሃ እግዚአብሔር', descriptionFr: 'Sens de la vie et crainte de Dieu' },
  { id: 'SNG', nameEn: 'Song of Songs', nameAm: 'መኃልየ መኃልይ ዘሰሎሞን', nameFr: 'Cantique des Cantiques', testament: 'OT', category: 'poetry', chaptersCount: 8, descriptionEn: 'Celebration of holy romantic love and covenant', descriptionAm: 'የፍቅር ውዳሴ እና የቃል ኪዳን ምስጢር', descriptionFr: 'Célébration de l\'amour pur et de l\'alliance' },

  // Major Prophets
  { id: 'ISA', nameEn: 'Isaiah', nameAm: 'ትንቢተ ኢሳይያስ', nameFr: 'Ésaïe', testament: 'OT', category: 'major_prophets', chaptersCount: 66, descriptionEn: 'The Holy One of Israel and the Suffering Servant', descriptionAm: 'የመሲሑ መምጣት እና የጽድቅ ተስፋ', descriptionFr: 'Le Saint d\'Israël et le Serviteur Souffrant' },
  { id: 'JER', nameEn: 'Jeremiah', nameAm: 'ትንቢተ ኤርምያስ', nameFr: 'Jérémie', testament: 'OT', category: 'major_prophets', chaptersCount: 52, descriptionEn: 'The weeping prophet and the New Covenant promise', descriptionAm: 'ንስሐ፣ የልብ መለወጥ እና አዲሱ ቃል ኪዳን', descriptionFr: 'Appel à la repentance et Nouvelle Alliance' },
  { id: 'LAM', nameEn: 'Lamentations', nameAm: 'ሰቆቃወ ኤርምያስ', nameFr: 'Lamentations', testament: 'OT', category: 'major_prophets', chaptersCount: 5, descriptionEn: 'Mourning over Jerusalem with faith in God\'s mercies', descriptionAm: 'የኢየሩሳሌም ኀዘን እና የእግዚአብሔር ምሕረት', descriptionFr: 'Deuil sur Jérusalem et fidélité de Dieu' },
  { id: 'EZK', nameEn: 'Ezekiel', nameAm: 'ትንቢተ ሕዝቅኤል', nameFr: 'Ézéchiel', testament: 'OT', category: 'major_prophets', chaptersCount: 48, descriptionEn: 'Visions of God\'s glory, dry bones, and restored temple', descriptionAm: 'የእግዚአብሔር ክብር ራእይ እና የደረቁ አጥንቶች መነሣት', descriptionFr: 'Visions de la gloire de Dieu et restauration' },
  { id: 'DAN', nameEn: 'Daniel', nameAm: 'ትንቢተ ዳንኤል', nameFr: 'Daniel', testament: 'OT', category: 'major_prophets', chaptersCount: 12, descriptionEn: 'Faithfulness under pressure and apocalyptic kingdoms', descriptionAm: 'በእምነት መጽናት እና የዘላለም መንግሥት ራእይ', descriptionFr: 'Fidélité sous l\'épreuve et visions prophétiques' },

  // Minor Prophets
  { id: 'HOS', nameEn: 'Hosea', nameAm: 'ትንቢተ ሆሴዕ', nameFr: 'Osée', testament: 'OT', category: 'minor_prophets', chaptersCount: 14, descriptionEn: 'God\'s unfailing love for unfaithful people', descriptionAm: 'የእግዚአብሔር የማያቋርጥ ፍቅር', descriptionFr: 'L\'amour inconditionnel de Dieu' },
  { id: 'JOL', nameEn: 'Joel', nameAm: 'ትንቢተ ኢዩኤል', nameFr: 'Joël', testament: 'OT', category: 'minor_prophets', chaptersCount: 3, descriptionEn: 'The Day of the Lord and the outpouring of the Holy Spirit', descriptionAm: 'የመንፈስ ቅዱስ መፍሰስ እና የእግዚአብሔር ቀን', descriptionFr: 'Le Jour de l\'Éternel et l\'effusion de l\'Esprit' },
  { id: 'AMO', nameEn: 'Amos', nameAm: 'ትንቢተ አሞጽ', nameFr: 'Amos', testament: 'OT', category: 'minor_prophets', chaptersCount: 9, descriptionEn: 'Justice rolling down like waters', descriptionAm: 'ፍትሕ እንደ ወንዝ ይፍሰስ', descriptionFr: 'La justice de Dieu pour les nations' },
  { id: 'OBA', nameEn: 'Obadiah', nameAm: 'ትንቢተ አብድዩ', nameFr: 'Abdias', testament: 'OT', category: 'minor_prophets', chaptersCount: 1, descriptionEn: 'Judgment on Edom and victory for Mount Zion', descriptionAm: 'በትዕቢተኞች ላይ የሚመጣ ፍርድ', descriptionFr: 'Jugement d\'Édom et triomphe de Sion' },
  { id: 'JON', nameEn: 'Jonah', nameAm: 'ትንቢተ ዮናስ', nameFr: 'Jonas', testament: 'OT', category: 'minor_prophets', chaptersCount: 4, descriptionEn: 'God\'s mercy extending to Nineveh', descriptionAm: 'የእግዚአብሔር ይቅር ባይነት እና የነነዌ ንስሐ', descriptionFr: 'La miséricorde de Dieu pour Ninive' },
  { id: 'MIC', nameEn: 'Micah', nameAm: 'ትንቢተ ሚክያስ', nameFr: 'Michée', testament: 'OT', category: 'minor_prophets', chaptersCount: 7, descriptionEn: 'Act justly, love mercy, walk humbly with your God', descriptionAm: 'ፍትሕን ማድረግ፣ ምሕረትን መውደድ እና በትሕትና መመላለስ', descriptionFr: 'Pratiquer la justice, aimer la miséricorde' },
  { id: 'NAM', nameEn: 'Nahum', nameAm: 'ትንቢተ ናሆም', nameFr: 'Nahum', testament: 'OT', category: 'minor_prophets', chaptersCount: 3, descriptionEn: 'God\'s judgment upon the oppressor', descriptionAm: 'በጨቋኞች ላይ የእግዚአብሔር ፍርድ', descriptionFr: 'Jugement sur l\'oppresseur' },
  { id: 'HAB', nameEn: 'Habakkuk', nameAm: 'ትንቢተ ዕንባቆም', nameFr: 'Habacuc', testament: 'OT', category: 'minor_prophets', chaptersCount: 3, descriptionEn: 'The righteous shall live by his faith', descriptionAm: 'ጻድቅ በእምነቱ በሕይወት ይኖራል', descriptionFr: 'Le juste vivra par sa foi' },
  { id: 'ZEP', nameEn: 'Zephaniah', nameAm: 'ትንቢተ ሶፎንያስ', nameFr: 'Sophonie', testament: 'OT', category: 'minor_prophets', chaptersCount: 3, descriptionEn: 'The great Day of the Lord and joy over the remnant', descriptionAm: 'የደስታ ዝማሬ እና መዳን', descriptionFr: 'Le Grand Jour de l\'Éternel et la joie du reste' },
  { id: 'HAG', nameEn: 'Haggai', nameAm: 'ትንቢተ ሐጌ', nameFr: 'Aggée', testament: 'OT', category: 'minor_prophets', chaptersCount: 2, descriptionEn: 'Rebuilding the temple and seeking God first', descriptionAm: 'የእግዚአብሔርን ቤት ማስቀደም', descriptionFr: 'Reconstruction du temple et priorité à Dieu' },
  { id: 'ZEC', nameEn: 'Zechariah', nameAm: 'ትንቢተ ዘካርያስ', nameFr: 'Zacharie', testament: 'OT', category: 'minor_prophets', chaptersCount: 14, descriptionEn: 'Visions of the Messianic King coming on a donkey', descriptionAm: 'የትሑቱ ንጉሥ መምጣት እና ክብር', descriptionFr: 'Le Roi Messianique et la rédemption' },
  { id: 'MAL', nameEn: 'Malachi', nameAm: 'ትንቢተ ሚልክያስ', nameFr: 'Malachie', testament: 'OT', category: 'minor_prophets', chaptersCount: 4, descriptionEn: 'Honoring God with pure worship and tithes', descriptionAm: 'ንጹሕ አምልኮ እና የጽድቅ ፀሐይ', descriptionFr: 'Culte pur et promesse du Messie' },

  // NEW TESTAMENT (ሐዲስ ኪዳን / Nouveau Testament)
  // Gospels
  { id: 'MAT', nameEn: 'Matthew', nameAm: 'የማቴዎስ ወንጌል', nameFr: 'Matthieu', testament: 'NT', category: 'gospels', chaptersCount: 28, descriptionEn: 'Jesus as the promised King and Messiah', descriptionAm: 'ኢየሱስ ክርስቶስ የተስፋው ንጉሥ እና መሲሕ', descriptionFr: 'Jésus, le Roi et Messie promis' },
  { id: 'MRK', nameEn: 'Mark', nameAm: 'የማርቆስ ወንጌል', nameFr: 'Marc', testament: 'NT', category: 'gospels', chaptersCount: 16, descriptionEn: 'Jesus as the Servant who gave His life a ransom', descriptionAm: 'ኢየሱስ ክርስቶስ ታዛዥ አገልጋይ እና ቤዛ', descriptionFr: 'Jésus, le Serviteur obéissant et Rédempteur' },
  { id: 'LUK', nameEn: 'Luke', nameAm: 'የሉቃስ ወንጌል', nameFr: 'Luc', testament: 'NT', category: 'gospels', chaptersCount: 24, descriptionEn: 'Jesus as the Son of Man who saves the lost', descriptionAm: 'የጠፉትን የሚፈልግና የሚያድን የሰው ልጅ', descriptionFr: 'Jésus, le Fils de l\'Homme venu sauver les perdus' },
  { id: 'JHN', nameEn: 'John', nameAm: 'የዮሐንስ ወንጌል', nameFr: 'Jean', testament: 'NT', category: 'gospels', chaptersCount: 21, descriptionEn: 'Jesus as the eternal Word and Son of God', descriptionAm: 'ኢየሱስ ክርስቶስ የዘላለም ቃል እና የእግዚአብሔር ልጅ', descriptionFr: 'Jésus, la Parole éternelle et Fils de Dieu' },

  // Acts
  { id: 'ACT', nameEn: 'Acts', nameAm: 'የሐዋርያት ሥራ', nameFr: 'Actes', testament: 'NT', category: 'acts', chaptersCount: 28, descriptionEn: 'Holy Spirit empowerment and spread of the early Church', descriptionAm: 'የመንፈስ ቅዱስ ኃይል እና የቤተክርስቲያን መስፋፋት', descriptionFr: 'Puissance du Saint-Esprit et expansion de l\'Église' },

  // Epistles of Paul
  { id: 'ROM', nameEn: 'Romans', nameAm: 'ወደ ሮሜ ሰዎች', nameFr: 'Romains', testament: 'NT', category: 'epistles', chaptersCount: 16, descriptionEn: 'Justification by faith, grace, and life in the Spirit', descriptionAm: 'በእምነት መጽደቅ፣ ጸጋ እና በመንፈስ መኖር', descriptionFr: 'Justification par la foi, grâce et vie par l\'Esprit' },
  { id: '1CO', nameEn: '1 Corinthians', nameAm: '1ኛ ወደ ቆሮንቶስ ሰዎች', nameFr: '1 Corinthiens', testament: 'NT', category: 'epistles', chaptersCount: 16, descriptionEn: 'Unity, holy conduct, spiritual gifts, and love', descriptionAm: 'አንድነት፣ መንፈሳዊ ስጦታዎች እና ፍቅር', descriptionFr: 'Unité, dons spirituels et l\'amour suprême' },
  { id: '2CO', nameEn: '2 Corinthians', nameAm: '2ኛ ወደ ቆሮንቶስ ሰዎች', nameFr: '2 Corinthiens', testament: 'NT', category: 'epistles', chaptersCount: 13, descriptionEn: 'Comfort in trials and power made perfect in weakness', descriptionAm: 'በመከራ ውስጥ ማጽናናት እና አዲስ ፍጥረት', descriptionFr: 'Consolation dans les épreuves et grâce suffisante' },
  { id: 'GAL', nameEn: 'Galatians', nameAm: 'ወደ ገላትያ ሰዎች', nameFr: 'Galates', testament: 'NT', category: 'epistles', chaptersCount: 6, descriptionEn: 'Freedom in Christ and walking in the Spirit', descriptionAm: 'በክርስቶስ ያለ ነጻነት እና የመንፈስ ፍሬ', descriptionFr: 'Liberté en Christ et fruits de l\'Esprit' },
  { id: 'EPH', nameEn: 'Ephesians', nameAm: 'ወደ ኤፌሶን ሰዎች', nameFr: 'Éphésiens', testament: 'NT', category: 'epistles', chaptersCount: 6, descriptionEn: 'The mystery of Christ, the Church, and spiritual armor', descriptionAm: 'በክርስቶስ ያለን ክብር እና የጦር ዕቃ', descriptionFr: 'Richesse en Christ, l\'Église et l\'armure de Dieu' },
  { id: 'PHP', nameEn: 'Philippians', nameAm: 'ወደ ፊልጵስዩስ ሰዎች', nameFr: 'Philippiens', testament: 'NT', category: 'epistles', chaptersCount: 4, descriptionEn: 'Rejoice in the Lord always and Christ\'s humility', descriptionAm: 'ሁልጊዜ በጌታ ደስ ይበላችሁ', descriptionFr: 'La joie dans le Seigneur et l\'humilité de Christ' },
  { id: 'COL', nameEn: 'Colossians', nameAm: 'ወደ ቆላስይስ ሰዎች', nameFr: 'Colossiens', testament: 'NT', category: 'epistles', chaptersCount: 4, descriptionEn: 'Supremacy and preeminence of Jesus Christ', descriptionAm: 'የክርስቶስ የበላይነት እና ሙሉነት', descriptionFr: 'Suprématie et plénitude en Christ' },
  { id: '1TH', nameEn: '1 Thessalonians', nameAm: '1ኛ ወደ ተሰሎንቄ ሰዎች', nameFr: '1 Thessaloniciens', testament: 'NT', category: 'epistles', chaptersCount: 5, descriptionEn: 'Encouragement and the blessed return of Christ', descriptionAm: 'የክርስቶስ ዳግም መምጣት እና ተስፋ', descriptionFr: 'Encouragement et espérance du retour de Christ' },
  { id: '2TH', nameEn: '2 Thessalonians', nameAm: '2ኛ ወደ ተሰሎንቄ ሰዎች', nameFr: '2 Thessaloniciens', testament: 'NT', category: 'epistles', chaptersCount: 3, descriptionEn: 'Steadfastness while awaiting the Day of the Lord', descriptionAm: 'በእምነት መጽናት እና መትጋት', descriptionFr: 'Persévérance dans l\'attente du Jour du Seigneur' },
  { id: '1TI', nameEn: '1 Timothy', nameAm: '1ኛ ወደ ጢሞቴዎስ', nameFr: '1 Timothée', testament: 'NT', category: 'epistles', chaptersCount: 6, descriptionEn: 'Pastoral leadership, sound doctrine, and godliness', descriptionAm: 'የአመራር ጥበብ እና እውነተኛ ትምህርት', descriptionFr: 'Direction pastorale et saine doctrine' },
  { id: '2TI', nameEn: '2 Timothy', nameAm: '2ኛ ወደ ጢሞቴዎስ', nameFr: '2 Timothée', testament: 'NT', category: 'epistles', chaptersCount: 4, descriptionEn: 'Preach the Word, finish the race, keep the faith', descriptionAm: 'ቃሉን ስበክ፣ ሩጫህን ጨርስ፣ እምነትህን ጠብቅ', descriptionFr: 'Prêche la Parole et garde la foi jusqu\'au bout' },
  { id: 'TIT', nameEn: 'Titus', nameAm: 'ወደ ቲቶ', nameFr: 'Tite', testament: 'NT', category: 'epistles', chaptersCount: 3, descriptionEn: 'Good works and living according to sound grace', descriptionAm: 'መልካም ሥራ እና የጸጋ ትምህርት', descriptionFr: 'Bonnes oeuvres et vie selon la saine doctrine' },
  { id: 'PHM', nameEn: 'Philemon', nameAm: 'ወደ ፊልሞና', nameFr: 'Philémon', testament: 'NT', category: 'epistles', chaptersCount: 1, descriptionEn: 'Reconciliation and brotherhood in Christ', descriptionAm: 'ይቅርታ እና በክርስቶስ ወንድማማች መሆን', descriptionFr: 'Réconciliation et fraternité chrétienne' },

  // General Epistles
  { id: 'HEB', nameEn: 'Hebrews', nameAm: 'ወደ ዕብራውያን', nameFr: 'Hébreux', testament: 'NT', category: 'epistles', chaptersCount: 13, descriptionEn: 'Jesus, our Great High Priest, better covenant and faith', descriptionAm: 'ኢየሱስ ታላቁ ሊቀ ካህናት እና የእምነት ጀግኖች', descriptionFr: 'Jésus, Souverain Sacrificateur et Nouvelle Alliance' },
  { id: 'JAS', nameEn: 'James', nameAm: 'የያዕቆብ መልእክት', nameFr: 'Jacques', testament: 'NT', category: 'epistles', chaptersCount: 5, descriptionEn: 'Faith that works, wisdom, and taming the tongue', descriptionAm: 'ሥራ ያለው እምነት እና እውነተኛ ጥበብ', descriptionFr: 'La foi agissante et la sagesse divine' },
  { id: '1PE', nameEn: '1 Peter', nameAm: '1ኛ የጴጥሮስ መልእክት', nameFr: '1 Pierre', testament: 'NT', category: 'epistles', chaptersCount: 5, descriptionEn: 'Living hope amid suffering and holy identity', descriptionAm: 'ሕያው ተስፋ እና በመከራ ውስጥ መጽናት', descriptionFr: 'Espérance vivante au sein de la souffrance' },
  { id: '2PE', nameEn: '2 Peter', nameAm: '2ኛ የጴጥሮስ መልእክት', nameFr: '2 Pierre', testament: 'NT', category: 'epistles', chaptersCount: 3, descriptionEn: 'Growing in grace and knowledge against false teachers', descriptionAm: 'በጸጋና በእውቀት ማደግ', descriptionFr: 'Croissance dans la grâce et vigilance spirituelle' },
  { id: '1JN', nameEn: '1 John', nameAm: '1ኛ የዮሐንስ መልእክት', nameFr: '1 Jean', testament: 'NT', category: 'epistles', chaptersCount: 5, descriptionEn: 'God is love and light; fellowship with Him', descriptionAm: 'እግዚአብሔር ፍቅር ነው፤ በእርሱ መኖር', descriptionFr: 'Dieu est lumière et amour; communion avec Lui' },
  { id: '2JN', nameEn: '2 John', nameAm: '2ኛ የዮሐንስ መልእክት', nameFr: '2 Jean', testament: 'NT', category: 'epistles', chaptersCount: 1, descriptionEn: 'Walking in truth and love', descriptionAm: 'በእውነትና በፍቅር መመላለስ', descriptionFr: 'Marcher dans la vérité et l\'amour' },
  { id: '3JN', nameEn: '3 John', nameAm: '3ኛ የዮሐንስ መልእክት', nameFr: '3 Jean', testament: 'NT', category: 'epistles', chaptersCount: 1, descriptionEn: 'Hospitality to fellow laborers in the truth', descriptionAm: 'ለእውነት ተባባሪዎች መሆን', descriptionFr: 'Hospitalité et fidélité envers les serviteurs de la vérité' },
  { id: 'JUD', nameEn: 'Jude', nameAm: 'የይሁዳ መልእክት', nameFr: 'Jude', testament: 'NT', category: 'epistles', chaptersCount: 1, descriptionEn: 'Contend earnestly for the faith once delivered', descriptionAm: 'ለተሰጠችው እምነት መጋደል', descriptionFr: 'Combattre pour la foi transmise aux saints' },

  // Revelation
  { id: 'REV', nameEn: 'Revelation', nameAm: 'የዮሐንስ ራእይ', nameFr: 'Apocalypse', testament: 'NT', category: 'revelation', chaptersCount: 22, descriptionEn: 'Triumph of the Lamb, King of Kings, and New Creation', descriptionAm: 'የበጉ ድል፣ አዲሱ ሰማይና አዲሲቱ ምድር', descriptionFr: 'Le triomphe de l\'Agneau, Roi des rois et Nouvelle Création' }
];

// Rich Curated Verses Database for Primary Reading Passages
export const CURATED_CHAPTERS_MAP: Record<string, BibleVerse[]> = {
  'GEN.1': [
    { id: 'GEN.1.1', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 1, textEn: 'In the beginning God created the heavens and the earth.', textFr: 'Au commencement, Dieu créa les cieux et la terre.', textAm: 'በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ።', notes: 'Hebrew: Bereshit Elohim bara. Foundation of biblical theology.' },
    { id: 'GEN.1.2', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 2, textEn: 'The earth was without form, and void; and darkness was on the face of the deep. And the Spirit of God was hovering over the face of the waters.', textFr: 'La terre était informe et vide: il y avait des ténèbres à la surface de l\'abîme, et l\'esprit de Dieu se mouvait au-dessus des eaux.', textAm: 'ምድርም ባዶ ነበረች፥ አንዳችም አልነበረባትም፤ ጨለማም በጥልቁ ላይ ነበረ፤ የእግዚአብሔርም መንፈስ በውኃ ላይ ሰፍፎ ነበር።' },
    { id: 'GEN.1.3', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 3, textEn: 'Then God said, "Let there be light"; and there was light.', textFr: 'Dieu dit: Que la lumière soit! Et la lumière fut.', textAm: 'እግዚአብሔርም፦ ብርሃን ይሁን አለ፤ ብርሃንም ሆነ።', notes: 'Creation by divine spoken word (Fiat Lux).' },
    { id: 'GEN.1.4', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 4, textEn: 'And God saw that the light was good; and God divided the light from the darkness.', textFr: 'Dieu vit que la lumière était bonne; et Dieu sépara la lumière d\'avec les ténèbres.', textAm: 'እግዚአብሔርም ብርሃኑ መልካም እንደ ሆነ አየ፤ እግዚአብሔርም ብርሃኑንና ጨለማውን ለየ።' },
    { id: 'GEN.1.5', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 5, textEn: 'God called the light Day, and the darkness He called Night. So the evening and the morning were the first day.', textFr: 'Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.', textAm: 'እግዚአብሔርም ብርሃኑን ቀን ብሎ ጠራው፥ ጨለማውንም ሌሊት አለው። ማታም ሆነ ጧትም ሆነ፥ አንድ ቀን።' },
    { id: 'GEN.1.6', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 6, textEn: 'Then God said, "Let there be a firmament in the midst of the waters, and let it divide the waters from the waters."', textFr: 'Dieu dit: Qu\'il y ait une étendue entre les eaux, et qu\'elle sépare les eaux d\'avec les eaux.', textAm: 'እግዚአብሔርም አለ፦ በውኃዎች መካከል ጠፈር ይሁን፥ በውኃና በውኃ መካከልም ይክፈል።' },
    { id: 'GEN.1.7', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 7, textEn: 'Thus God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament; and it was so.', textFr: 'Et Dieu fit l\'étendue, et il sépara les eaux qui sont au-dessous de l\'étendue d\'avec les eaux qui sont au-dessus de l\'étendue. Et cela fut ainsi.', textAm: 'እግዚአብሔርም ጠፈርን አደረገ፥ ከጠፈር በታችና ከጠፈር በላይ ያሉትንም ውኃዎች ለየ፤ እንዲሁም ሆነ።' },
    { id: 'GEN.1.8', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 8, textEn: 'And God called the firmament Heaven. So the evening and the morning were the second day.', textFr: 'Dieu appela l\'étendue ciel. Ainsi, il y eut un soir, et il y eut un matin: ce fut le second jour.', textAm: 'እግዚአብሔርም ጠፈርን ሰማይ ብሎ ጠራው። ማታም ሆነ ጧትም ሆነ፥ ሁለተኛ ቀን።' },
    { id: 'GEN.1.9', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 9, textEn: 'Then God said, "Let the waters under the heavens be gathered together into one place, and let the dry land appear"; and it was so.', textFr: 'Dieu dit: Que les eaux qui sont au-dessous du ciel se rassemblent en un seul lieu, et que le sec paraisse. Et cela fut ainsi.', textAm: 'እግዚአብሔርም አለ፦ ከሰማይ በታች ያለው ውኃ ወደ አንድ ስፍራ ይሰብሰብ፥ የብሱም ይገለጥ፤ እንዲሁም ሆነ።' },
    { id: 'GEN.1.10', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 10, textEn: 'And God called the dry land Earth, and the gathering together of the waters He called Seas. And God saw that it was good.', textFr: 'Dieu appela le sec terre, et il appela l\'amas des eaux mers. Dieu vit que cela était bon.', textAm: 'እግዚአብሔርም የብሱን ምድር ብሎ ጠራው፥ የውኃውንም መከማቻ ባሕር አለው፤ እግዚአብሔርም ያ መልካም እንደ ሆነ አየ።' },
    { id: 'GEN.1.11', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 11, textEn: 'Then God said, "Let the earth bring forth grass, the herb that yields seed, and the fruit tree that yields fruit according to its kind, whose seed is in itself, on the earth"; and it was so.', textFr: 'Puis Dieu dit: Que la terre produise de la verdure, de l\'herbe portant de la semence, des arbres fruitiers donnant du fruit selon leur espèce et ayant en eux leur semence sur la terre. Et cela fut ainsi.', textAm: 'እግዚአብሔርም አለ፦ ምድር ዘሩ በውስጡ ያለውን ቡቃያና ዘርን የሚሰጥ ሣርን፥ እንደ ወገኑ በምድር ላይ ዘሩ ያለውን ፍሬ የሚያፈራውንም ዛፍ ታብቅል፤ እንዲሁም ሆነ።' },
    { id: 'GEN.1.12', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 12, textEn: 'And the earth brought forth grass, the herb that yields seed according to its kind, and the tree that yields fruit, whose seed is in itself according to its kind. And God saw that it was good.', textFr: 'La terre produisit de la verdure, de l\'herbe portant de la semence selon son espèce, et des arbres donnant du fruit et ayant en eux leur semence selon leur espèce. Dieu vit que cela était bon.', textAm: 'ምድርም ዘሩ በውስጡ ያለውን ቡቃያና እንደ ወገኑ ዘርን የሚሰጥ ሣርን፥ እንደ ወገኑም ዘሩ ያለውን ፍሬ የሚያፈራውን ዛፍ አበቀለች። እግዚአብሔርም ያ መልካም እንደ ሆነ አየ።' },
    { id: 'GEN.1.13', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 13, textEn: 'So the evening and the morning were the third day.', textFr: 'Ainsi, il y eut un soir, et il y eut un matin: ce fut le troisième jour.', textAm: 'ማታም ሆነ ጧትም ሆነ፥ ሦስተኛ ቀን።' },
    { id: 'GEN.1.14', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 14, textEn: 'Then God said, "Let there be lights in the firmament of the heavens to divide the day from the night; and let them be for signs and seasons, and for days and years;"', textFr: 'Dieu dit: Qu\'il y ait des luminaires dans l\'étendue du ciel, pour séparer le jour d\'avec la nuit; que ce soient des signes pour marquer les époques, les jours et les années;', textAm: 'እግዚአብሔርም አለ፦ ቀንና ሌሊትን ይለዩ ዘንድ ብርሃናት በሰማይ ጠፈር ይሁኑ፤ ለምልክትም ለዘመናትም ለዕለታትም ለዓመታትም ይሁኑ፤' },
    { id: 'GEN.1.15', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 15, textEn: 'and let them be for lights in the firmament of the heavens to give light on the earth; and it was so.', textFr: 'et qu\'ils servent de luminaires dans l\'étendue du ciel, pour éclairer la terre. Et cela fut ainsi.', textAm: 'በምድር ላይ ያበሩ ዘንድ በሰማይ ጠፈር ብርሃናት ይሁኑ፤ እንዲሁም ሆነ።' },
    { id: 'GEN.1.16', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 16, textEn: 'Then God made two great lights: the greater light to rule the day, and the lesser light to rule the night. He made the stars also.', textFr: 'Dieu fit les deux grands luminaires, le plus grand luminaire pour présider au jour, et le plus petit luminaire pour présider à la nuit; il fit aussi les étoiles.', textAm: 'እግዚአብሔርም ሁለት ታላላቆች ብርሃናትን አደረገ፤ ትልቁ ብርሃን በቀን እንዲሠለጥን፥ ትንሹም ብርሃን በሌሊት እንዲሠለጥን፤ ከዋክብትንም ደግሞ አደረገ።' },
    { id: 'GEN.1.17', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 17, textEn: 'God set them in the firmament of the heavens to give light on the earth,', textFr: 'Dieu les plaça dans l\'étendue du ciel, pour éclairer la terre,', textAm: 'እግዚአብሔርም በምድር ላይ ያበሩ ዘንድ በሰማይ ጠፈር አኖራቸው፤' },
    { id: 'GEN.1.18', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 18, textEn: 'and to rule over the day and over the night, and to divide the light from the darkness. And God saw that it was good.', textFr: 'pour présider au jour et à la nuit, et pour séparer la lumière d\'avec les ténèbres. Dieu vit que cela était bon.', textAm: 'በቀንም በሌሊትም እንዲሠለጥኑ፥ ብርሃኑንና ጨለማውንም እንዲለዩ፤ እግዚአብሔርም ያ መልካም እንደ ሆነ አየ።' },
    { id: 'GEN.1.19', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 19, textEn: 'So the evening and the morning were the fourth day.', textFr: 'Ainsi, il y eut un soir, et il y eut un matin: ce fut le quatrième jour.', textAm: 'ማታም ሆነ ጧትም ሆነ፥ አራተኛ ቀን።' },
    { id: 'GEN.1.20', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 20, textEn: 'Then God said, "Let the waters abound with an abundance of living creatures, and let birds fly above the earth across the face of the firmament of the heavens."', textFr: 'Dieu dit: Que les eaux produisent en abondance des animaux vivants, et que des oiseaux volent sur la terre vers l\'étendue du ciel.', textAm: 'እግዚአብሔርም አለ፦ ውኃ ሕያው ነፍስ ያላቸውን ተንቀሳቃሾችን ታውጣ፥ ወፎችም ከምድር በላይ ከሰማይ ጠፈር በታች ይብረሩ።' },
    { id: 'GEN.1.21', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 21, textEn: 'So God created great sea creatures and every living thing that moves, with which the waters abounded, according to their kind, and every winged bird according to its kind. And God saw that it was good.', textFr: 'Dieu créa les grands poissons et tous les animaux vivants qui se meuvent, et que les eaux produisirent en abondance selon leur espèce; il créa aussi tout oiseau ailé selon son espèce. Dieu vit que cela était bon.', textAm: 'እግዚአብሔርም ታላላቆች አንበሪዎችን፥ ውኃ እንደ ወገኑ ያወጣቸውን ተንቀሳቃሾቹን ሕያዋን ፍጥረታት ሁሉ፥ ክንፍ ያለውንም ወፍ ሁሉ እንደ ወገኑ ፈጠረ፤ እግዚአብሔርም ያ መልካም እንደ ሆነ አየ።' },
    { id: 'GEN.1.22', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 22, textEn: 'And God blessed them, saying, "Be fruitful and multiply, and fill the waters in the seas, and let birds multiply on the earth."', textFr: 'Dieu les bénit, en disant: Soyez féconds, multipliez, et remplissez les eaux des mers; et que les oiseaux multiplient sur la terre.', textAm: 'እግዚአብሔርም ባረካቸው እንዲህም አለ፦ ተባዙ፥ ተባዙም፥ የባሕርንም ውኃ ሙሉአት፥ ወፎችም በምድር ላይ ይብዙ።' },
    { id: 'GEN.1.23', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 23, textEn: 'So the evening and the morning were the fifth day.', textFr: 'Ainsi, il y eut un soir, et il y eut un matin: ce fut le cinquième jour.', textAm: 'ማታም ሆነ ጧትም ሆነ፥ አምስተኛ ቀን።' },
    { id: 'GEN.1.24', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 24, textEn: 'Then God said, "Let the earth bring forth the living creature according to its kind: cattle and creeping thing and beast of the earth, each according to its kind"; and it was so.', textFr: 'Dieu dit: Que la terre produise des animaux vivants selon leur espèce, du bétail, des reptiles et des animaux terrestres, selon leur espèce. Et cela fut ainsi.', textAm: 'እግዚአብሔርም አለ፦ ምድር ሕያዋን ፍጥረታትን እንደ ወገኑ፥ እንስሳትንና ተንቀሳቃሾችን የምድርም አራዊትን እንደ ወገኑ፥ ታውጣ፤ እንዲሁም ሆነ።' },
    { id: 'GEN.1.25', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 25, textEn: 'And God made the beast of the earth according to its kind, cattle according to its kind, and everything that creeps on the earth according to its kind. And God saw that it was good.', textFr: 'Dieu fit les animaux de la terre selon leur espèce, le bétail selon son espèce, et tous les reptiles de la terre selon leur espèce. Dieu vit que cela était bon.', textAm: 'እግዚአብሔርም የምድር አራዊትን እንደ ወገኑ አደረገ፥ እንስሳውንም እንደ ወገኑ፥ በምድር ላይ የሚንቀሳቀሰውንም ሁሉ እንደ ወገኑ አደረገ፤ እግዚአብሔርም ያ መልካም እንደ ሆነ አየ።' },
    { id: 'GEN.1.26', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 26, textEn: 'Then God said, "Let Us make man in Our image, according to Our likeness; let them have dominion over the fish of the sea, over the birds of the air, and over the cattle, over all the earth and over every creeping thing that creeps on the earth."', textFr: 'Puis Dieu dit: Faisons l\'homme à notre image, selon notre ressemblance, et qu\'il domine sur les poissons de la mer, sur les oiseaux du ciel, sur le bétail, sur toute la terre, et sur tous les reptiles qui rampent sur la terre.', textAm: 'እግዚአብሔርም አለ፦ ሰውን በመልካችን እንደ ምሳሌአችን እንፍጠር፤ የባሕር ዓሦችንና የሰማይ ወፎችን፥ እንስሳትንና ምድርን ሁሉ፥ በምድር ላይ የሚንቀሳቀሱትንም ሁሉ ይግዙ።', notes: 'The apex of creation: humanity formed in Imago Dei.' },
    { id: 'GEN.1.27', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 27, textEn: 'So God created man in His own image; in the image of God He created him; male and female He created them.', textFr: 'Dieu créa l\'homme à son image, il le créa à l\'image de Dieu, il créa l\'homme et la femme.', textAm: 'እግዚአብሔርም ሰውን በመልኩ ፈጠረ፤ በእግዚአብሔር መልክ ፈጠረው፤ ወንድና ሴት አድርጎ ፈጠራቸው።' },
    { id: 'GEN.1.28', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 28, textEn: 'Then God blessed them, and God said to them, "Be fruitful and multiply; fill the earth and subdue it; have dominion over the fish of the sea, over the birds of the air, and over every living thing that moves on the earth."', textFr: 'Dieu les bénit, et Dieu leur dit: Soyez féconds, multipliez, remplissez la terre, et l\'assujettissez; et dominez sur les poissons de la mer, sur les oiseaux du ciel, et sur tout animal qui se meut sur la terre.', textAm: 'እግዚአብሔርም ባረካቸው፥ እንዲህም አላቸው፦ ብዙ፥ ተባዙም፥ ምድርንም ሙሉአት፥ ግዟትም፤ የባሕር ዓሦችንና የሰማይ ወፎችን በምድር ላይ የሚንቀሳቀሱትንም ሁሉ ግዟቸው።' },
    { id: 'GEN.1.29', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 29, textEn: 'And God said, "See, I have given you every herb that yields seed which is on the face of all the earth, and every tree whose fruit yields seed; to you it shall be for food."', textFr: 'Et Dieu dit: Voici, je vous donne toute herbe portant de la semence et qui est à la surface de toute la terre, et tout arbre ayant en lui du fruit d\'arbre et portant de la semence: ce sera votre nourriture.', textAm: 'እግዚአብሔርም አለ፦ እነሆ መብል ይሆናችሁ ዘንድ በምድር ሁሉ ላይ ዘሩ በውስጡ ያለውን ቡቃያ ሁሉ፥ የዛፍ ፍሬ ያለውና ዘር የሚያፈራውንም ዛፍ ሁሉ ሰጠኋችሁ፤' },
    { id: 'GEN.1.30', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 30, textEn: 'Also, to every beast of the earth, to every bird of the air, and to everything that creeps on the earth, in which there is life, I have given every green herb for food; and it was so.', textFr: 'Et à tout animal de la terre, à tout oiseau du ciel, et à tout ce qui se meut sur la terre, ayant en soi un souffle de vie, je donne toute herbe verte pour nourriture. Et cela fut ainsi.', textAm: 'ለምድር አራዊት ሁሉ፥ ለሰማይም ወፎች ሁሉ፥ ሕያው ነፍስ ላላቸው ለምድር ተንቀሳቃሾችም ሁሉ የሚበቅለው ለምለሙ ሣር ሁሉ መብል ይሁንላችሁ፤ እንዲሁም ሆነ።' },
    { id: 'GEN.1.31', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 1, verse: 31, textEn: 'Then God saw everything that He had made, and indeed it was very good. So the evening and the morning were the sixth day.', textFr: 'Dieu vit tout ce qu\'il avait fait et voici, cela était très bon. Ainsi, il y eut un soir, et il y eut un matin: ce fut le sixième jour.', textAm: 'እግዚአብሔርም ያደረገውን ሁሉ አየ፥ እነሆም፥ እጅግ መልካም ነበረ። ማታም ሆነ ጧትም ሆነ፥ ስድስተኛ ቀን።' }
  ],
  'GEN.2': [
    { id: 'GEN.2.1', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 2, verse: 1, textEn: 'Thus the heavens and the earth, and all the host of them, were finished.', textFr: 'Ainsi furent achevés les cieux et la terre, et toute leur armée.', textAm: 'ሰማይና ምድር ሠራዊታቸውም ሁሉ ተፈጸሙ።' },
    { id: 'GEN.2.2', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 2, verse: 2, textEn: 'And on the seventh day God ended His work which He had done, and He rested on the seventh day from all His work which He had done.', textFr: 'Dieu acheva au septième jour son oeuvre, qu\'il avait faite: et il se reposa au septième jour de toute son oeuvre, qu\'il avait faite.', textAm: 'እግዚአብሔርም የሠራውን ሥራ በሰባተኛው ቀን ፈጸመ፤ በሰባተኛውም ቀን ከሠራው ሥራ ሁሉ ዐረፈ።' },
    { id: 'GEN.2.3', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 2, verse: 3, textEn: 'Then God blessed the seventh day and sanctified it, because in it He rested from all His work which God had created and made.', textFr: 'Dieu bénit le septième jour, et il le sanctifia, parce qu\'en ce jour il se reposa de toute son oeuvre qu\'il avait créée en la faisant.', textAm: 'እግዚአብሔርም ሰባተኛውን ቀን ባረከው ቀደሰውም፥ እግዚአብሔር ሊያደርገው ከፈጠረው ሥራ ሁሉ በእርሱ ዐርፎአልና።' },
    { id: 'GEN.2.7', bookId: 'GEN', bookNameEn: 'Genesis', bookNameAm: 'ኦሪት ዘፍጥረት', bookNameFr: 'Genèse', chapter: 2, verse: 7, textEn: 'And the Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living being.', textFr: 'L\'Éternel Dieu forma l\'homme de la poussière de la terre, il souffla dans ses narines un souffle de vie et l\'homme devint un être vivant.', textAm: 'እግዚአብሔር አምላክም ሰውን ከምድር አፈር አበጀው፤ በአፍንጫውም የሕይወት እስትንፋስን እፍ አለበት፤ ሰውም ሕያው ነፍስ ያለው ሆነ።' }
  ],
  'PSA.23': [
    { id: 'PSA.23.1', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 1, textEn: 'The Lord is my shepherd; I shall not want.', textAm: 'እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።', notes: 'David describes Jehovah-Rohi (The Lord My Shepherd).' },
    { id: 'PSA.23.2', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 2, textEn: 'He makes me to lie down in green pastures; He leads me beside the still waters.', textAm: 'በለመለመ መስክ ያሳድረኛል፤ በዕረፍት ውኃ ዘንድ ይመራኛል።' },
    { id: 'PSA.23.3', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 3, textEn: 'He restores my soul; He leads me in the paths of righteousness for His name\'s sake.', textAm: 'ነፍሴን መለሳት፥ ስለ ስሙም በጽድቅ መንገድ መራኝ።' },
    { id: 'PSA.23.4', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 4, textEn: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for You are with me; Your rod and Your staff, they comfort me.', textAm: 'በሞት ጥላ ሸለቆ እንኳ ብሄድ አንተ ከእኔ ጋር ነህና ክፉን አልፈራም፤ በትረህና ምርኵዝህ እነርሱ ያጸናኑኛል።' },
    { id: 'PSA.23.5', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 5, textEn: 'You prepare a table before me in the presence of my enemies; You anoint my head with oil; my cup runs over.', textAm: 'በፊቴ ገበታን አዘጋጀህልኝ በጠላቶቼ ፊት ለፊት፤ ራሴን በዘይት ቀባህ፥ ጽዋዬም የተረፈ ነው።' },
    { id: 'PSA.23.6', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 6, textEn: 'Surely goodness and mercy shall follow me all the days of my life; and I will dwell in the house of the Lord forever.', textAm: 'በእውነት ቸርነትህና ምሕረትህ በሕይወቴ ዘመን ሁሉ ይከተሉኛል፥ በእግዚአብሔርም ቤት ለዘላለም እኖራለሁ።' }
  ],
  'PSA.91': [
    { id: 'PSA.91.1', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 91, verse: 1, textEn: 'He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.', textAm: 'በልዑል መጠጊያ የሚኖር ሁሉን በሚችል አምላክ ጥላ ሥር ያድራል።' },
    { id: 'PSA.91.2', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 91, verse: 2, textEn: 'I will say of the Lord, "He is my refuge and my fortress; my God, in Him I will trust."', textAm: 'እግዚአብሔርን፦ አንተ መታመኛዬና አምባዬ ነህ፥ የምታመንብህ አምላኬ እለዋለሁ።' },
    { id: 'PSA.91.4', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 91, verse: 4, textEn: 'He shall cover you with His feathers, and under His wings you shall take refuge; His truth shall be your shield and buckler.', textAm: 'በላባዎቹ ይጋርድሃል፥ በክንፎቹም በታች ትተማመናለህ፤ እውነቱ እንደ ጋሻ ይከብብሃል።' },
    { id: 'PSA.91.11', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 91, verse: 11, textEn: 'For He shall give His angels charge over you, to keep you in all your ways.', textAm: 'በመንገድህ ሁሉ ይጠብቁህ ዘንድ መላእክቱን ስለ አንተ ያዝዛቸዋልና።' }
  ],
  'PRO.3': [
    { id: 'PRO.3.5', bookId: 'PRO', bookNameEn: 'Proverbs', bookNameAm: 'መጽሐፈ ምሳሌ', chapter: 3, verse: 5, textEn: 'Trust in the Lord with all your heart, and lean not on your own understanding;', textAm: 'በፍጹም ልብህ በእግዚአብሔር ታመን፥ በራስህም ማስተዋል አትደገፍ፤' },
    { id: 'PRO.3.6', bookId: 'PRO', bookNameEn: 'Proverbs', bookNameAm: 'መጽሐፈ ምሳሌ', chapter: 3, verse: 6, textEn: 'In all your ways acknowledge Him, and He shall direct your paths.', textAm: 'በመንገድህ ሁሉ እርሱን እወቅ፥ እርሱም ጎዳናህን ያቀናልሃል።' },
    { id: 'PRO.3.7', bookId: 'PRO', bookNameEn: 'Proverbs', bookNameAm: 'መጽሐፈ ምሳሌ', chapter: 3, verse: 7, textEn: 'Do not be wise in your own eyes; fear the Lord and depart from evil.', textAm: 'በራስህ አስተያየት ጠቢብ አትሁን፤ እግዚአብሔርን ፍራ፥ ከክፉም ራቅ።' }
  ],
  'ISA.40': [
    { id: 'ISA.40.28', bookId: 'ISA', bookNameEn: 'Isaiah', bookNameAm: 'ትንቢተ ኢሳይያስ', chapter: 40, verse: 28, textEn: 'Have you not known? Have you not heard? The everlasting God, the Lord, the Creator of the ends of the earth, neither faints nor is weary. His understanding is unsearchable.', textAm: 'አላወቅህምን? አልሰማህምን? እግዚአብሔር የዘላለም አምላክ፥ የምድር ዳርቻ ፈጣሪ ነው፥ አይደክምም አይታክትምም፥ ማስተዋሉም አይመረመርም።' },
    { id: 'ISA.40.29', bookId: 'ISA', bookNameEn: 'Isaiah', bookNameAm: 'ትንቢተ ኢሳይያስ', chapter: 40, verse: 29, textEn: 'He gives power to the weak, and to those who have no might He increases strength.', textAm: 'ለደከመው ኃይልን ይሰጣል፥ ጉልበት ለሌለውም ብርታትን ይጨምራል።' },
    { id: 'ISA.40.31', bookId: 'ISA', bookNameEn: 'Isaiah', bookNameAm: 'ትንቢተ ኢሳይያስ', chapter: 40, verse: 31, textEn: 'But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.', textAm: 'እግዚአብሔርን በመተማመን የሚጠባበቁ ግን ኃይላቸውን ያድሳሉ፤ እንደ ንስር በክንፍ ይወጣሉ፤ ይሮጣሉ አይታክቱም፥ ይሄዳሉ አይደክሙም።' }
  ],
  'MAT.5': [
    { id: 'MAT.5.1', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 1, textEn: 'And seeing the multitudes, He went up on a mountain, and when He was seated His disciples came to Him.', textAm: 'ሕዝቡንም አይቶ ወደ ተራራ ወጣ፤ በተቀመጠም ጊዜ ደቀ መዛሙርቱ ወደ እርሱ ቀረቡ፤' },
    { id: 'MAT.5.3', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 3, textEn: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.', textAm: 'በመንፈስ ድሆች የሆኑ ብፁዓን ናቸው፥ መንግሥተ ሰማያት የእነርሱ ናትና።' },
    { id: 'MAT.5.4', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 4, textEn: 'Blessed are those who mourn, for they shall be comforted.', textAm: 'የሚያዝኑ ብፁዓን ናቸው፥ መፅናናትን ያገኛሉና።' },
    { id: 'MAT.5.5', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 5, textEn: 'Blessed are the meek, for they shall inherit the earth.', textAm: 'የዋሆች ብፁዓን ናቸው፥ ምድርን ይወርሳሉና።' },
    { id: 'MAT.5.6', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 6, textEn: 'Blessed are those who hunger and thirst for righteousness, for they shall be filled.', textAm: 'ጽድቅን የሚራቡና የሚጠሙ ብፁዓን ናቸው፥ ይጠግባሉና።' },
    { id: 'MAT.5.7', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 7, textEn: 'Blessed are the merciful, for they shall obtain mercy.', textAm: 'ምሕረት የሚያደርጉ ብፁዓን ናቸው፥ ምሕረትን ያገኛሉና።' },
    { id: 'MAT.5.8', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 8, textEn: 'Blessed are the pure in heart, for they shall see God.', textAm: 'ልበ ንጹሖች ብፁዓን ናቸው፥ እግዚአብሔርን ያዩታልና።' },
    { id: 'MAT.5.9', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 9, textEn: 'Blessed are the peacemakers, for they shall be called sons of God.', textAm: 'የሚያስተራርቁ ብፁዓን ናቸው፥ የእግዚአብሔር ልጆች ይባላሉና።' },
    { id: 'MAT.5.14', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 14, textEn: 'You are the light of the world. A city that is set on a hill cannot be hidden.', textAm: 'እናንተ የዓለም ብርሃን ናችሁ። በተራራ ላይ ያለች ከተማ ልትሰወር አይቻላትም።' },
    { id: 'MAT.5.16', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 5, verse: 16, textEn: 'Let your light so shine before men, that they may see your good works and glorify your Father in heaven.', textAm: 'መልካሙን ሥራችሁን አይተው በሰማያት ያለውን አባታችሁን እንዲያከብሩ ብርሃናችሁ እንዲሁ በሰው ፊት ይብራ።' }
  ],
  'MAT.6': [
    { id: 'MAT.6.9', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 9, textEn: 'In this manner, therefore, pray: Our Father in heaven, hallowed be Your name.', textAm: 'እንግዲህ እናንተስ እንዲህ ጸልዩ፦ በሰማያት የምትኖር አባታችን ሆይ፥ ስምህ ይቀደስ፤' },
    { id: 'MAT.6.10', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 10, textEn: 'Your kingdom come. Your will be done on earth as it is in heaven.', textAm: 'መንግሥትህ ትምጣ፤ ፈቃድህ በሰማይ እንደ ሆነች እንዲሁ በምድር ትሁን፤' },
    { id: 'MAT.6.11', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 11, textEn: 'Give us this day our daily bread.', textAm: 'የዕለት እንጀራችንን ዛሬ ስጠን፤' },
    { id: 'MAT.6.12', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 12, textEn: 'And forgive us our debts, as we forgive our debtors.', textAm: 'እኛም ደግሞ የበደሉንን ይቅር እንደምንል በደላችንን ይቅር በለን፤' },
    { id: 'MAT.6.13', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 13, textEn: 'And do not lead us into temptation, but deliver us from the evil one. For Yours is the kingdom and the power and the glory forever. Amen.', textAm: 'ከክፉም አድነን እንጂ ወደ ፈተና አታግባን፤ መንግሥት ያንተ ናትና ኃይልም ክብርም ለዘለዓለሙ፤ አሜን።' },
    { id: 'MAT.6.33', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 33, textEn: 'But seek first the kingdom of God and His righteousness, and all these things shall be added to you.', textAm: 'ነገር ግን አስቀድማችሁ የእግዚአብሔርን መንግሥት ጽድቁንም ፈልጉ፥ ይህም ሁሉ ይጨመርላችኋል።' },
    { id: 'MAT.6.34', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 34, textEn: 'Therefore do not worry about tomorrow, for tomorrow will worry about its own things. Sufficient for the day is its own trouble.', textAm: 'ነገ ለራሱ ይጨነቃልና ለነገ አትጨነቁ፤ ለቀኑ ክብደቱ ይበቃዋል።' }
  ],
  'JHN.1': [
    { id: 'JHN.1.1', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 1, textEn: 'In the beginning was the Word, and the Word was with God, and the Word was God.', textAm: 'በመጀመሪያ ቃል ነበረ፥ ቃልም በእግዚአብሔር ዘንድ ነበረ፥ ቃልም እግዚአብሔር ነበረ።', notes: 'Greek: Logos. Christ as the pre-existent, uncreated Word.' },
    { id: 'JHN.1.2', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 2, textEn: 'He was in the beginning with God.', textAm: 'ይህ በመጀመሪያ በእግዚአብሔር ዘንድ ነበረ።' },
    { id: 'JHN.1.3', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 3, textEn: 'All things were made through Him, and without Him nothing was made that was made.', textAm: 'ሁሉ በእርሱ ሆነ፥ ከሆነውም አንዳች እንኳ ያለ እርሱ አልሆነም።' },
    { id: 'JHN.1.4', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 4, textEn: 'In Him was life, and the life was the light of men.', textAm: 'በእርሱ ሕይወት ነበረች፥ ሕይወትም የሰው ብርሃን ነበረች።' },
    { id: 'JHN.1.5', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 5, textEn: 'And the light shines in the darkness, and the darkness did not comprehend it.', textAm: 'ብርሃንም በጨለማ ይበራል፥ ጨለማውም አላሸነፈውም።' },
    { id: 'JHN.1.12', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 12, textEn: 'But as many as received Him, to them He gave the right to become children of God, to those who believe in His name:', textAm: 'ለተቀበሉት ሁሉ ግን፥ በስሙ ለሚያምኑት ለእነርሱ የእግዚአብሔር ልጆች ይሆኑ ዘንድ ሥልጣንን ሰጣቸው፤' },
    { id: 'JHN.1.14', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 1, verse: 14, textEn: 'And the Word became flesh and dwelt among us, and we beheld His glory, the glory as of the only begotten of the Father, full of grace and truth.', textAm: 'ቃልም ሥጋ ሆነ፤ ጸጋንና እውነትንም ተሞልቶ በእኛ አደረ፥ የአባቱም አንድያ ልጅ እንዳለው ክብር የሆነው ክብሩን አየን።' }
  ],
  'JHN.3': [
    { id: 'JHN.3.16', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 3, verse: 16, textEn: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.', textAm: 'በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት እንዲኖረው እንጂ እንዳይጠፋ እግዚአብሔር አንድያ ልጁን እስኪሰጥ ድረስ ዓለሙን እንዲሁ ወዶአልና።', notes: 'The central gospel message of salvation by faith.' },
    { id: 'JHN.3.17', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 3, verse: 17, textEn: 'For God did not send His Son into the world to condemn the world, but that the world through Him might be saved.', textAm: 'ዓለም በልጁ እንዲድን እንጂ በዓለም እንዲፈርድ እግዚአብሔር ልጁን ወደ ዓለም አልላከውምና።' }
  ],
  'ROM.8': [
    { id: 'ROM.8.1', bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8, verse: 1, textEn: 'There is therefore now no condemnation to those who are in Christ Jesus, who do not walk according to the flesh, but according to the Spirit.', textAm: 'እንግዲህ በክርስቶስ ኢየሱስ ላሉት አሁን ምንም ኩነኔ የለባቸውም።' },
    { id: 'ROM.8.28', bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8, verse: 28, textEn: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.', textAm: 'እግዚአብሔርንም ለሚወዱት እንደ አሳቡም ለተጠሩት ነገር ሁሉ ለበጎ እንዲደረግ እናውቃለን።' },
    { id: 'ROM.8.31', bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8, verse: 31, textEn: 'What then shall we say to these things? If God is for us, who can be against us?', textAm: 'እንግዲህ ስለዚህ ነገር ምን እንላለን? እግዚአብሔር ከእኛ ጋር ከሆነ ማን ይቃወመናል?' },
    { id: 'ROM.8.38', bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8, verse: 38, textEn: 'For I am persuaded that neither death nor life, nor angels nor principalities nor powers, nor things present nor things to come,', textAm: 'ሞት ቢሆን፥ ሕይወትም ቢሆን፥ መላእክትም ቢሆኑ፥ ግዛትም ቢሆን፥ ያለውም ቢሆን፥ የሚመጣውም ቢሆን፥ ኃይላትም ቢሆኑ፥' },
    { id: 'ROM.8.39', bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8, verse: 39, textEn: 'Nor height nor depth, nor any other created thing, shall be able to separate us from the love of God which is in Christ Jesus our Lord.', textAm: 'ከፍታም ቢሆን፥ ዝቅታም ቢሆን፥ ልዩ ፍጥረትም ቢሆን በክርስቶስ ኢየሱስ በጌታችን ካለው ከእግዚአብሔር ፍቅር ሊለየን እንዳይችል ተረድቼአለሁ።' }
  ],
  'PHP.4': [
    { id: 'PHP.4.4', bookId: 'PHP', bookNameEn: 'Philippians', bookNameAm: 'ወደ ፊልጵስዩስ ሰዎች', chapter: 4, verse: 4, textEn: 'Rejoice in the Lord always. Again I will say, rejoice!', textAm: 'ሁልጊዜ በጌታ ደስ ይበላችሁ፤ ደግሜ እላለሁ፥ ደስ ይበላችሁ።' },
    { id: 'PHP.4.6', bookId: 'PHP', bookNameEn: 'Philippians', bookNameAm: 'ወደ ፊልጵስዩስ ሰዎች', chapter: 4, verse: 6, textEn: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God;', textAm: 'በነገር ሁሉ በጸሎትና በምልጃ ከምስጋና ጋር በእግዚአብሔር ዘንድ ልመናችሁን አስታውቁ እንጂ በአንዳች አትጨነቁ፤' },
    { id: 'PHP.4.7', bookId: 'PHP', bookNameEn: 'Philippians', bookNameAm: 'ወደ ፊልጵስዩስ ሰዎች', chapter: 4, verse: 7, textEn: 'And the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.', textAm: 'አእምሮንም ሁሉ የሚያልፍ የእግዚአብሔር ሰላም ልባችሁንና አሳባችሁን በክርስቶስ ኢየሱስ ይጠብቃል።' },
    { id: 'PHP.4.13', bookId: 'PHP', bookNameEn: 'Philippians', bookNameAm: 'ወደ ፊልጵስዩስ ሰዎች', chapter: 4, verse: 13, textEn: 'I can do all things through Christ who strengthens me.', textAm: 'ኃይልን በሚሰጠኝ በክርስቶስ ሁሉን እችላለሁ።' }
  ],
  'REV.21': [
    { id: 'REV.21.1', bookId: 'REV', bookNameEn: 'Revelation', bookNameAm: 'የዮሐንስ ራእይ', chapter: 21, verse: 1, textEn: 'Now I saw a new heaven and a new earth, for the first heaven and the first earth had passed away. Also there was no more sea.', textAm: 'አዲስ ሰማይንና አዲስ ምድርንም አየሁ፥ ፊተኛው ሰማይና ፊተኛይቱ ምድር አልፈዋልና፥ ባሕሩም ወደ ፊት የለም።' },
    { id: 'REV.21.3', bookId: 'REV', bookNameEn: 'Revelation', bookNameAm: 'የዮሐንስ ራእይ', chapter: 21, verse: 3, textEn: 'And I heard a loud voice from heaven saying, "Behold, the tabernacle of God is with men, and He will dwell with them, and they shall be His people. God Himself will be with them and be their God."', textAm: 'ታላቅም ድምፅ ከሰማይ፦ እነሆ፥ የእግዚአብሔር ድንኳን በሰዎች መካከል ነው ከእነርሱም ጋር ያድራል፥ እነርሱም ሕዝቡ ይሆናሉ እግዚአብሔርም ራሱ ከእነርሱ ጋር ሆኖ አምላካቸው ይሆናል፤' },
    { id: 'REV.21.4', bookId: 'REV', bookNameEn: 'Revelation', bookNameAm: 'የዮሐንስ ራእይ', chapter: 21, verse: 4, textEn: 'And God will wipe away every tear from their eyes; there shall be no more death, nor sorrow, nor crying. There shall be no more pain, for the former things have passed away.', textAm: 'እንባዎችንም ሁሉ ከዓይኖቻቸው ያብሳል፥ ሞትም ከእንግዲህ ወዲህ አይሆንም፥ ኀዘንም ቢሆን ወይም ጩኸት ወይም ሥቃይ ከእንግዲህ ወዲህ አይሆንም፥ የቀደመው ሥርዓት አልፎአልና ብሎ ሲናገር ሰማሁ።' }
  ]
};

// --- Real scripture text (KJV / Louis Segond 1910 / traditional Amharic) ---
// Bundled as static per-book JSON under public/bible/<BookId>.json rather
// than in this module, since the full text runs ~15MB across 66 books --
// far too large to bundle into the JS build. fetchChapterContent() is the
// function every reader should call; getChapterContent() below is a
// synchronous FALLBACK ONLY, used when the real text can't be loaded (e.g.
// no network and nothing cached yet) -- its output is generated filler
// text, not actual scripture, and must never be presented as such.

interface RealVerseRow { v: number; en: string; fr: string; am: string; }
interface RealChapterRow { c: number; verses: RealVerseRow[]; }
interface RealBookFile { id: string; chapters: RealChapterRow[]; }

const bookTextCache = new Map<string, Promise<RealBookFile>>();

/// Makes sure a book's real text is persisted for offline reading -- used
/// by the reader's explicit "Save Offline" button. A no-op if it's already
/// cached (loadBookText checks IndexedDB before touching the network).
export async function ensureBookOffline(bookId: string): Promise<void> {
  await loadBookText(bookId);
}

async function loadBookText(bookId: string): Promise<RealBookFile> {
  let pending = bookTextCache.get(bookId);
  if (!pending) {
    pending = (async () => {
      // 1. IndexedDB first -- works offline and survives reloads.
      const offline = await StorageManager.getOfflineBook(bookId);
      if (offline) return offline as RealBookFile;

      // 2. Fall back to the network, then persist for next time (including offline).
      const res = await fetch(`/bible/${bookId}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${bookId}`);
      const data = (await res.json()) as RealBookFile;
      void StorageManager.saveOfflineBook(bookId, data); // fire-and-forget
      return data;
    })().catch(err => {
      bookTextCache.delete(bookId); // allow a retry on the next call instead of caching the failure
      throw err;
    });
    bookTextCache.set(bookId, pending);
  }
  return pending;
}

/// Fetches real, public-domain scripture text for one chapter: King James
/// Version (English), Louis Segond 1910 (French), and the traditional
/// Amharic Bible (as published by wordproject.org -- the same source this
/// app already uses for Amharic audio). Falls back to getChapterContent()'s
/// generated filler text only if the real data can't be loaded.
export async function fetchChapterContent(bookId: string, chapterNumber: number): Promise<ChapterContent> {
  const book = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  try {
    const bookText = await loadBookText(book.id);
    const chapter = bookText.chapters.find(c => c.c === chapterNumber);
    if (!chapter) throw new Error(`Chapter ${chapterNumber} not found in ${book.id}`);

    return {
      bookId: book.id,
      bookNameEn: book.nameEn,
      bookNameAm: book.nameAm,
      bookNameFr: book.nameFr || book.nameEn,
      chapter: chapterNumber,
      totalChapters: book.chaptersCount,
      verses: chapter.verses.map((v): BibleVerse => ({
        id: `${book.id}.${chapterNumber}.${v.v}`,
        bookId: book.id,
        bookNameEn: book.nameEn,
        bookNameAm: book.nameAm,
        bookNameFr: book.nameFr || book.nameEn,
        chapter: chapterNumber,
        verse: v.v,
        textEn: v.en,
        textAm: v.am,
        textFr: v.fr,
      })),
    };
  } catch (err) {
    console.warn(`[bibleData] Real text unavailable for ${bookId} ${chapterNumber}, using placeholder text:`, err);
    return getChapterContent(bookId, chapterNumber);
  }
}

// Fallback-only generator -- see the note above. Do not call this directly
// from UI code; use fetchChapterContent().
export function getChapterContent(bookId: string, chapterNumber: number): ChapterContent {
  const book = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  const key = `${book.id}.${chapterNumber}`;
  
  if (CURATED_CHAPTERS_MAP[key]) {
    return {
      bookId: book.id,
      bookNameEn: book.nameEn,
      bookNameAm: book.nameAm,
      chapter: chapterNumber,
      totalChapters: book.chaptersCount,
      verses: CURATED_CHAPTERS_MAP[key]
    };
  }

  // Generate complete structured chapter verses with authentic biblical themes
  const generatedVerses: BibleVerse[] = [];
  const verseCount = getEstimatedVerseCount(book.id, chapterNumber);

  for (let v = 1; v <= verseCount; v++) {
    generatedVerses.push({
      id: `${book.id}.${chapterNumber}.${v}`,
      bookId: book.id,
      bookNameEn: book.nameEn,
      bookNameAm: book.nameAm,
      bookNameFr: book.nameFr || book.nameEn,
      chapter: chapterNumber,
      verse: v,
      textEn: getSyntheticVerseEn(book.nameEn, chapterNumber, v),
      textFr: getSyntheticVerseFr(book.nameFr || book.nameEn, chapterNumber, v),
      textAm: getSyntheticVerseAm(book.nameAm, chapterNumber, v),
      notes: v === 1 ? `Chapter ${chapterNumber} opening themes in ${book.nameEn} (${book.nameAm}).` : undefined
    });
  }

  return {
    bookId: book.id,
    bookNameEn: book.nameEn,
    bookNameAm: book.nameAm,
    bookNameFr: book.nameFr || book.nameEn,
    chapter: chapterNumber,
    totalChapters: book.chaptersCount,
    verses: generatedVerses
  };
}

function getEstimatedVerseCount(bookId: string, chapter: number): number {
  if (bookId === 'PSA') {
    if (chapter === 119) return 24; // Sample segment
    if (chapter === 23) return 6;
    return 12;
  }
  if (bookId === 'MAT' || bookId === 'LUK' || bookId === 'ACT') return 20;
  if (chapter === 1) return 15;
  return 14;
}

function getSyntheticVerseEn(bookName: string, chapter: number, verse: number): string {
  const samples = [
    `The word of the Lord came unto the saints, saying: Stand firm in the covenant of grace and walk in righteousness.`,
    `Hear, O people of God, and give ear to the instruction of truth, for the Lord is good and His mercy endures forever.`,
    `Blessed is the one who trusts in the Lord and meditates day and night on His holy testimonies.`,
    `For the Lord gives wisdom; out of His mouth comes knowledge and understanding to guide our steps.`,
    `And they praised God with one voice, rejoicing in His lovingkindness and abundant salvation throughout all generations.`,
    `Be strong and courageous, do not fear, for the Lord your God goes with you wherever you walk.`,
    `The heavens declare the glory of God, and the firmament proclaims the work of His hands.`,
    `He sent forth His word and healed them, delivering them from all their distresses and fears.`,
    `Cast your burden upon the Lord, and He will sustain you; He will never permit the righteous to be moved.`,
    `For with God nothing will be impossible, and His promises stand forever established in truth.`
  ];
  return `[${bookName} ${chapter}:${verse}] ${samples[(chapter * 7 + verse) % samples.length]}`;
}

function getSyntheticVerseFr(bookNameFr: string, chapter: number, verse: number): string {
  const samplesFr = [
    `La parole de l'Éternel fut adressée aux saints, disant: Demeurez fermes dans l'alliance de grâce et marchez dans la justice.`,
    `Écoutez, peuple de Dieu, et prêtez l'oreille à l'instruction de la vérité, car l'Éternel est bon et sa miséricorde dure à toujours.`,
    `Heureux l'homme qui se confie en l'Éternel et qui médite jour et nuit sur ses saints témoignages.`,
    `Car l'Éternel donne la sagesse; de sa bouche sortent la connaissance et l'intelligence pour guider nos pas.`,
    `Et ils louèrent Dieu d'une seule voix, se réjouissant dans sa bonté et son salut abondant de génération en génération.`,
    `Fortifiez-vous et prenez courage, ne craignez point, car l'Éternel votre Dieu marche avec vous partout où vous irez.`,
    `Les cieux racontent la gloire de Dieu, et l'étendue céleste annonce l'oeuvre de ses mains.`,
    `Il envoya sa parole et les guérit, les délivrant de toutes leurs détresses et de leurs craintes.`,
    `Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira; il ne laissera jamais chanceler le juste.`,
    `Car rien n'est impossible à Dieu, et ses promesses demeurent à jamais établies dans la vérité.`
  ];
  return `[${bookNameFr} ${chapter}:${verse}] ${samplesFr[(chapter * 7 + verse) % samplesFr.length]}`;
}

function getSyntheticVerseAm(bookNameAm: string, chapter: number, verse: number): string {
  const samples = [
    `የእግዚአብሔር ቃል እንዲህ ሲል መጣ፦ በጸጋው ቃል ኪዳን ቁሙ፥ በቅድስናም ተመላለሱ።`,
    `የእግዚአብሔር ሕዝብ ሆይ፥ ስሙ የእውነትንም ትምህርት አድምጡ፤ እግዚአብሔር ቸር ነውና፥ ምሕረቱም ለዘላለም ነውና።`,
    `በእግዚአብሔር የሚታመን፥ በሕጉም ላይ ቀንና ሌሊት የሚያሰላስል ሰው የተባረከ ነው።`,
    `እግዚአብሔር ጥበብን ይሰጣልና፤ ከአፉም እውቀትና ማስተዋል ይወጣሉ።`,
    `በአንድ ድምፅም እግዚአብሔርን አመሰገኑ፥ በታላቅ ምሕረቱና በዘላለም ማዳኑም እጅግ ደስ አላቸው።`,
    `ጽኑ አይዞአችሁ አትፍሩም፤ አምላካችሁ እግዚአብሔር በምትሄዱበት ሁሉ ከእናንተ ጋር ይሆናልና።`,
    `ሰማያት የእግዚአብሔርን ክብር ይናገራሉ፥ የሰማይም ጠፈር የእጆቹን ሥራ ያወራል።`,
    `ቃሉን ላከ ፈወሳቸውም፥ ከመከራቸውም ሁሉ አዳናቸው።`,
    `ሸክምህን በእግዚአብሔር ላይ ጣል፥ እርሱም ይደግፍሃል፤ ጻድቁም ለዘላለም እንዲናወጥ አይፈቅድም።`,
    `ለእግዚአብሔር የሚሳነው ነገር የለምና፥ የተስፋውም ቃል ለዘላለም በእውነት የጸና ነው።`
  ];
  return `[${bookNameAm} ${chapter}:${verse}] ${samples[(chapter * 7 + verse) % samples.length]}`;
}

// Daily Verse of the Day pool with full bilingual verses
export const DAILY_VERSE_POOL: BibleVerse[] = [
  { id: 'PSA.23.1', bookId: 'PSA', bookNameEn: 'Psalms', bookNameAm: 'መዝሙረ ዳዊት', chapter: 23, verse: 1, textEn: 'The Lord is my shepherd; I shall not want.', textAm: 'እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።' },
  { id: 'PRO.3.5-6', bookId: 'PRO', bookNameEn: 'Proverbs', bookNameAm: 'መጽሐፈ ምሳሌ', chapter: 3, verse: 5, textEn: 'Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.', textAm: 'በፍጹም ልብህ በእግዚአብሔር ታመን፥ በራስህም ማስተዋል አትደገፍ፤ በመንገድህ ሁሉ እርሱን እወቅ፥ እርሱም ጎዳናህን ያቀናልሃል።' },
  { id: 'ISA.40.31', bookId: 'ISA', bookNameEn: 'Isaiah', bookNameAm: 'ትንቢተ ኢሳይያስ', chapter: 40, verse: 31, textEn: 'Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.', textAm: 'እግዚአብሔርን በመተማመን የሚጠባበቁ ግን ኃይላቸውን ያድሳሉ፤ እንደ ንስር በክንፍ ይወጣሉ።' },
  { id: 'PHP.4.13', bookId: 'PHP', bookNameEn: 'Philippians', bookNameAm: 'ወደ ፊልጵስዩስ ሰዎች', chapter: 4, verse: 13, textEn: 'I can do all things through Christ who strengthens me.', textAm: 'ኃይልን በሚሰጠኝ በክርስቶስ ሁሉን እችላለሁ።' },
  { id: 'JHN.3.16', bookId: 'JHN', bookNameEn: 'John', bookNameAm: 'የዮሐንስ ወንጌል', chapter: 3, verse: 16, textEn: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.', textAm: 'በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት እንዲኖረው እንጂ እንዳይጠፋ እግዚአብሔር አንድያ ልጁን እስኪሰጥ ድረስ ዓለሙን እንዲሁ ወዶአልና።' },
  { id: 'ROM.8.28', bookId: 'ROM', bookNameEn: 'Romans', bookNameAm: 'ወደ ሮሜ ሰዎች', chapter: 8, verse: 28, textEn: 'And we know that all things work together for good to those who love God, to those who are called according to His purpose.', textAm: 'እግዚአብሔርንም ለሚወዱት እንደ አሳቡም ለተጠሩት ነገር ሁሉ ለበጎ እንዲደረግ እናውቃለን።' },
  { id: 'JER.29.11', bookId: 'JER', bookNameEn: 'Jeremiah', bookNameAm: 'ትንቢተ ኤርምያስ', chapter: 29, verse: 11, textEn: 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.', textAm: 'ለእናንተ የማስባትን አሳብ እኔ አውቃለሁ፤ ፍጻሜና ተስፋ እሰጣችሁ ዘንድ የሰላም አሳብ ነው እንጂ የክፉ አይደለም ይላል እግዚአብሔር።' },
  { id: 'JOS.1.9', bookId: 'JOS', bookNameEn: 'Joshua', bookNameAm: 'መጽሐፈ ኢያሱ', chapter: 1, verse: 9, textEn: 'Have I not commanded you? Be strong and of good courage; do not be afraid, nor be dismayed, for the Lord your God is with you wherever you go.', textAm: 'በውኑ አላዘዝሁህምን? ጽና፥ አይዞህ፤ በምትሄድበት ሁሉ አምላክህ እግዚአብሔር ከአንተ ጋር ነውና አትፍራ፥ አትደንግጥ።' },
  { id: 'MAT.6.33', bookId: 'MAT', bookNameEn: 'Matthew', bookNameAm: 'የማቴዎስ ወንጌል', chapter: 6, verse: 33, textEn: 'Seek first the kingdom of God and His righteousness, and all these things shall be added to you.', textAm: 'ነገር ግን አስቀድማችሁ የእግዚአብሔርን መንግሥት ጽድቁንም ፈልጉ፥ ይህም ሁሉ ይጨመርላችኋል።' },
  { id: '2TI.1.7', bookId: '2TI', bookNameEn: '2 Timothy', bookNameAm: '2ኛ ወደ ጢሞቴዎስ', chapter: 1, verse: 7, textEn: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.', textAm: 'እግዚአብሔር የኃይልና የፍቅር ራስንም የመግዛት መንፈስ እንጂ የፍርሃት መንፈስ አልሰጠንምና።' }
];

export function getTodayVerse(): BibleVerse {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  return DAILY_VERSE_POOL[dayOfYear % DAILY_VERSE_POOL.length];
}
