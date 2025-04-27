

const destinations = [
    { placeName: "Santorini", countryName: "Greece", regionName: "Cyclades", folder: "santorini", imageCount: 7,
      highlights: [
        "Wander through Fira’s whitewashed lanes cascading over the Caldera",
        "Bask on the volcanic black sands of Perissa Beach",
        "Savor a sunset cruise along the shimmering Aegean",
        "Discover the vibrant red sands of Red Beach",
        "Explore the ancient allure of Thera’s archaeological treasures"
      ] },
    { placeName: "Amalfi Coast", countryName: "Italy", regionName: "Campania", folder: "amalfi", imageCount: 7,
      highlights: [
        "Traverse the celestial Path of the Gods with panoramic sea vistas",
        "Stroll the enchanted gardens of Villa Cimbrone in Ravello",
        "Admire the majestic Duomo di Sant’Andrea in Amalfi’s heart",
        "Revel in the historic splendor of Villa Rufolo’s terraces",
        "Unwind at the serene Fiordo di Furore, a hidden coastal gem"
      ]
     },
    { placeName: "Bali", countryName: "Indonesia", regionName: "Lesser Sunda Islands", folder: "bali", imageCount: 5,
      highlights: [
        "Plunge into the tropical thrills of Waterbom Bali’s lush slides",
        "Encounter mischievous macaques in the Sacred Monkey Forest Sanctuary",
        "Gaze upon the emerald tiers of Tegalalang Rice Terrace",
        "Delight in the exotic wonders of Bali Zoo’s vibrant wildlife",
        "Embrace the spiritual serenity of Tanah Lot Temple at dusk"
      ]
     },
    { placeName: "Banff National Park", countryName: "Canada", regionName: "Alberta", folder: "banff", imageCount: 5,
      highlights: [
        "Marvel at the turquoise splendor of Lake Louise beneath towering peaks",
        "Capture the mirrored beauty of Moraine Lake’s glacier-fed waters",
        "Venture through the mist-kissed trails of Johnston Canyon",
        "Ascend Sulphur Mountain via the Banff Gondola for alpine vistas",
        "Journey along the Icefields Parkway, a corridor of rugged majesty"
      ]
     },
    { placeName: "Bora Bora", countryName: "French Polynesia", regionName: "Leeward Islands", folder: "borabora", imageCount: 5,
      highlights: [
        "Dive into the vibrant marine world of the Bora Bora Lagoonarium",
        "Lounge on the pristine, palm-fringed sands of Matira Beach",
        "Embark on a thrilling 4x4 adventure through lush jungles",
        "Sail across turquoise waters on an enchanting boat tour",
        "Snorkel amidst the kaleidoscopic Coral Gardens"
      ]
     },
    { placeName: "Cappadocia", countryName: "Turkey", regionName: "Central Anatolia", folder: "Cappadocia", imageCount: 5,
      highlights: [
        "Soar above surreal landscapes in a dawn hot air balloon ride",
        "Uncover ancient frescoes in the Goreme Open-Air Museum",
        "Ascend the rugged heights of Uchisar Castle for panoramic views",
        "Marvel at the whimsical Fairy Chimneys dotting the valleys",
        "Hike the verdant trails of Ihlara Valley’s canyon oasis"
      ]
     },
    { placeName: "Chefchaouen", countryName: "Morocco", regionName: "Tanger-Tetouan-Al Hoceima region", folder: "chefchouen", imageCount: 5,
      highlights: [
        "Meander through the azure-hued alleys of the blue-washed medina",
        "Trek to the cascading splendor of Cascades d’Akchour",
        "Savor the vibrant ambiance of Place Outa el Hammam",
        "Gaze upon the Rif Mountains from the Spanish Mosque’s perch",
        "Rejuvenate by the tranquil waters of Ras El Ma waterfall"
      ]
     },
    { placeName: "Dubrovnik", countryName: "Croatia", regionName: "Dalmatia", folder: "dubrovnik", imageCount: 6,
      highlights: [
        "Stroll atop the ancient Dubrovnik City Walls with Adriatic views",
        "Lose yourself in the timeless charm of the Old Town’s marble streets",
        "Escape to the lush serenity of Lokrum Island’s botanical gardens",
        "Ride the cable car to Mount Srd for a breathtaking panorama",
        "Wander the polished limestone of Stradun, Dubrovnik’s vibrant heart"
      ]
     },
    { placeName: "Hallstatt", countryName: "Austria", regionName: "Salzkammergut", folder: "hallstatt", imageCount: 5,
      highlights: [
        "Stand atop the Hallstatt Skywalk, gazing over alpine splendor",
        "Delve into the ancient Salzwelten salt mine’s subterranean wonders",
        "Glide across the tranquil Hallstätter See on a serene boat ride",
        "Explore the fairy-tale charm of Hallstatt’s historic Old Town",
        "Discover the haunting beauty of the Beinhaus, the Bone House"
      ]
     },
    { placeName: "Kyoto", countryName: "Japan", regionName: "Kansai", folder: "kyoto", imageCount: 6,
      highlights: [
        "Traverse the vermilion torii gates of Fushimi Inari-taisha Shrine",
        "Behold the golden radiance of Kinkakuji Temple’s shimmering pavilion",
        "Wander the sacred precincts of Kiyomizu-dera Temple’s wooden stage",
        "Stroll through the whispering Arashiyama Bamboo Grove",
        "Immerse in the warrior spirit at the Samurai & Ninja Museum"
      ]
     },
    { placeName: "Lofoten Islands", countryName: "Norway", regionName: "Nordland county", folder: "Lofoten", imageCount: 5,
      highlights: [
        "Climb to Reinebringen for a breathtaking Arctic panorama",
        "Discover the timeless allure of Reine’s fishing village",
        "Chase the ethereal northern lights or bask in the midnight sun",
        "Uncover Viking lore at the Lofotr Viking Museum",
        "Relax on the pristine sands of Haukland Beach"
      ]
     },
    { placeName: "Machu Picchu", countryName: "Peru", regionName: "Cusco", folder: "machupicchu", imageCount: 5,
      highlights: [
        "Unveil the mystic ruins of Machu Picchu, lost city of the Incas",
        "Hike to the Sun Gate, Intipunku, for a celestial vantage",
        "Ascend the sacred heights of Huayna Picchu’s rugged trails",
        "Marvel at the intricate stonework of the Temple of the Sun",
        "Contemplate the ancient Intihuatana stone’s cosmic alignment"
      ]
     },
    { placeName: "Petra", countryName: "Jordan", regionName: "Ma'an district", folder: "petra", imageCount: 6,
      highlights: [
        "Journey through the Siq to the Treasury’s rose-red grandeur",
        "Ascend to the Monastery, a monumental Nabataean masterpiece",
        "Explore the intricate Royal Tombs carved into desert cliffs",
        "Walk the Colonnaded Street to the majestic Great Temple",
        "Hike to the High Place of Sacrifice for sweeping desert vistas"
      ]
     },
    { placeName: "Reynisfjara", countryName: "Iceland", regionName: "South Coast", folder: "reynisfjara", imageCount: 6,
      highlights: [
        "Tread the dramatic black sands of Reynisfjara Beach",
        "Admire the geometric marvel of towering basalt columns",
        "Gaze upon the mythical Reynisdrangar sea stacks",
        "Explore the enigmatic caves sculpted by the sea",
        "Witness the untamed fury of the Atlantic’s crashing waves"
      ]
     },
    { placeName: "Tuscany", countryName: "Italy", regionName: "Florence", folder: "tuscany", imageCount:  5,
      highlights: [
        "Immerse in Florence’s Renaissance treasures and art-filled museums",
        "Wander Siena’s medieval lanes and majestic Piazza del Campo",
        "Marvel at the iconic Leaning Tower of Pisa’s architectural wonder",
        "Savor the robust flavors of Chianti’s rolling vineyard estates",
        "Discover San Gimignano’s medieval towers piercing the Tuscan sky"
      ]
    },
    { placeName: "Oia", countryName: "Faroe Islands", regionName: "Vagar", folder: "oia", imageCount:  6,
      highlights: [
        "Witness a golden sunset from the historic Oia Castle",
        "Descend to Amoudi Bay’s turquoise waters and quaint tavernas",
        "Admire the iconic blue-domed churches against whitewashed walls",
        "Meander through Oia’s labyrinthine streets of timeless charm",
        "Explore the maritime legacy at the Naval Maritime Museum"
      ]
    },
    { placeName: "Grand Canal", countryName: "Italy", regionName: "Veneto", folder: "venice", imageCount:  5,
      highlights: [
        "Glide along the Grand Canal in a romantic gondola at twilight",
        "Admire the historic elegance of the Rialto Bridge’s arches",
        "Discover modern masterpieces at the Peggy Guggenheim Collection",
        "Explore the Gothic splendor of Ca’ d’Oro’s gilded halls",
        "Marvel at the baroque magnificence of Santa Maria della Salute"
      ]
    },
  ];

  export const getImagePaths = (folder) => {
    const sizes = ["small", "medium", "large", "xlarge"];
    const basePath = `/static/destinations/${folder}`;
    return sizes.reduce((acc, size) => {
      acc[size] = {
        webp: `${basePath}/${folder}-webp/${folder}-webp-${size}/${folder}1.webp`,
        jpg: `${basePath}/${folder}-jpg/${folder}-jpg-${size}/${folder}1.jpg`,
      };
      return acc;
    }, {});
  };


  export default destinations;