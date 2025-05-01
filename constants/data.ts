import { MdHome, MdDevices } from "react-icons/md";
import { IoCardOutline } from "react-icons/io5";
import { GrShieldSecurity } from "react-icons/gr";
import { FaTheaterMasks } from "react-icons/fa";
import { IconType } from "react-icons";

interface SideMenuItemProps {
  id: number;
  name: string;
  link: string;
  icon: IconType;
}

export const faq = [
  {
    id: 1,
    question: "What is Netflix?",
    answer:
      "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want – all for one low monthly price. There's always something new to discover and new TV shows and movies are added every week!",
  },
  {
    id: 2,
    question: "How much does Netflix cost?",
    answer:
      "Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $7.99 to $23.99 a month (pre-tax). No extra costs, no contracts.",
  },
  {
    id: 3,
    question: "Where can I watch?",
    answer:
      "Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles. You can also download your favorite shows with the iOS or Android app. Use downloads to watch while you're on the go and without an internet connection. Take Netflix with you anywhere.",
  },
  {
    id: 4,
    question: "How do I cancel?",
    answer:
      "Netflix is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime.",
  },
  {
    id: 5,
    question: "What can I watch on Netflix?",
    answer:
      "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want.",
  },
  {
    id: 6,
    question: "Is Netflix good for kids?",
    answer:
      "The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see.",
  },
];

export const trendingShows = [
  {
    ranking: 1,
    name: "Jane the Virgin",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 2,
    name: "Wonder woman",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 3,
    name: "Flash",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 4,
    name: "Fast and Furious",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 5,
    name: "Aquaman",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 6,
    name: "Superman",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 7,
    name: "Batman",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 8,
    name: "Arrow",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 9,
    name: "Avenger: Endgames",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
  {
    ranking: 10,
    name: "Isoken",
    image: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  },
];

export const features = [
  {
    id: 1,
    title: "Cancel or Switch plan anytime",
    icon: "https://res.cloudinary.com/dixwarqdb/image/upload/v1744710927/handshake_iloiiz.png",
  },
  {
    id: 2,
    title: "A safe place just for kids",
    icon: "https://res.cloudinary.com/dixwarqdb/image/upload/v1744710928/heart_hmckef.png",
  },
  {
    id: 3,
    title: "Watch on your favorite devices",
    icon: "https://res.cloudinary.com/dixwarqdb/image/upload/v1744710927/device_nt74i1.png",
  },
  {
    id: 4,
    title: "Stories tailored to your taste",
    icon: "https://res.cloudinary.com/dixwarqdb/image/upload/v1744710928/star_i0szvc.png",
  },
];

export const sideMenuItems: SideMenuItemProps[] = [
  {
    id: 1,
    name: "Overview",
    link: "/account",
    icon: MdHome,
  },
  {
    id: 2,
    name: "Membership",
    link: "/account/membership",
    icon: IoCardOutline,
  },
  {
    id: 3,
    name: "Security",
    link: "/account/security",
    icon: GrShieldSecurity,
  },
  {
    id: 4,
    name: "Devices",
    link: "/account/devices",
    icon: MdDevices,
  },
  {
    id: 5,
    name: "Profiles",
    link: "/account/profiles",
    icon: FaTheaterMasks,
  },
];

export const mediaExtraData = [
  // Movies
  {
    title: "Big Buck Bunny",
    maturityRating: "PG",
    contentRating: ["mild cartoon violence", "slapstick humor"],
    cast: ["Jan Morgenstern", "Sacha Goedegebure", "Andreas Goralczyk"],
    director: ["Sacha Goedegebure"],
    writer: ["Sacha Goedegebure", "Jan Morgenstern"],
    tagline: "Hare today, gone tomorrow!",
    keywords: ["animation", "bunny", "comedy", "short film"],
    releaseDate: "2008-04-10",
    isTvShow: false,
    isAdult: false,
  },
  {
    title: "Sintel",
    maturityRating: "PG",
    contentRating: ["fantasy violence", "emotional themes"],
    cast: ["Halina Reijn", "Thom Hoffman", "Tycho Maas"],
    director: ["Colin Levy"],
    writer: ["Esther Wouda"],
    tagline: "A dragon's tale of love and loss",
    keywords: ["dragon", "fantasy", "quest", "short film"],
    releaseDate: "2010-09-27",
    isTvShow: false,
    isAdult: false,
  },
  {
    title: "Tears of Steel",
    maturityRating: "PG-13",
    contentRating: ["sci-fi violence", "robot battles", "mild language"],
    cast: ["Derek de Lint", "Rogier Schippers", "Valerie van der Graaf"],
    director: ["Ian Hubert"],
    writer: ["Ian Hubert", "Menno Deen"],
    tagline: "Humanity's last stand against the machines",
    keywords: ["robots", "apocalypse", "sci-fi", "short film"],
    releaseDate: "2012-09-26",
    isTvShow: false,
    isAdult: false,
  },
  {
    title: "Elephant's Dream",
    maturityRating: "PG",
    contentRating: ["psychological themes", "surreal imagery"],
    cast: ["Tygo Gernandt", "Cas Jansen"],
    director: ["Bassam Kurdali"],
    writer: ["Bassam Kurdali", "Ton Roosendaal"],
    tagline: "A journey through the machine of dreams",
    keywords: ["experimental", "animation", "sci-fi", "short film"],
    releaseDate: "2006-03-24",
    isTvShow: false,
    isAdult: false,
  },
  {
    title: "Inception",
    maturityRating: "PG-13",
    contentRating: ["intense action sequences", "violence", "sci-fi themes"],
    cast: [
      "Leonardo DiCaprio",
      "Joseph Gordon-Levitt",
      "Elliot Page",
      "Tom Hardy",
      "Ken Watanabe",
    ],
    director: ["Christopher Nolan"],
    writer: ["Christopher Nolan"],
    tagline: "Your mind is the scene of the crime",
    keywords: ["dreams", "heist", "mind-bending", "sci-fi thriller"],
    releaseDate: "2010-07-16",
    isTvShow: false,
    isAdult: false,
  },
  {
    title: "The Shawshank Redemption",
    maturityRating: "R",
    contentRating: ["prison violence", "strong language", "adult themes"],
    cast: [
      "Tim Robbins",
      "Morgan Freeman",
      "Bob Gunton",
      "William Sadler",
      "Clancy Brown",
    ],
    director: ["Frank Darabont"],
    writer: ["Frank Darabont"],
    tagline: "Fear can hold you prisoner. Hope can set you free.",
    keywords: ["prison", "friendship", "redemption", "classic"],
    releaseDate: "1994-09-23",
    isTvShow: false,
    isAdult: true,
  },
  {
    title: "The Dark Knight",
    maturityRating: "PG-13",
    contentRating: ["intense violence", "disturbing content", "some language"],
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Michael Caine",
      "Gary Oldman",
    ],
    director: ["Christopher Nolan"],
    writer: ["Jonathan Nolan", "Christopher Nolan"],
    tagline: "Why so serious?",
    keywords: ["batman", "joker", "superhero", "psychological thriller"],
    releaseDate: "2008-07-18",
    isTvShow: false,
    isAdult: false,
  },
  {
    title: "Parasite",
    maturityRating: "R",
    contentRating: ["violence", "language", "sexual content"],
    cast: [
      "Song Kang-ho",
      "Lee Sun-kyun",
      "Cho Yeo-jeong",
      "Choi Woo-shik",
      "Park So-dam",
    ],
    director: ["Bong Joon-ho"],
    writer: ["Bong Joon-ho", "Han Jin-won"],
    tagline: "Act like you own the place",
    keywords: ["class struggle", "dark comedy", "Oscar winner", "thriller"],
    releaseDate: "2019-05-21",
    isTvShow: false,
    isAdult: true,
  },

  // TV Shows
  {
    title: "The Last Kingdom",
    maturityRating: "TV-MA",
    contentRating: [
      "graphic violence",
      "war scenes",
      "strong language",
      "sexual content",
    ],
    cast: [
      "Alexander Dreymon",
      "David Dawson",
      "Eliza Butterworth",
      "Tobias Santelmann",
      "Emily Cox",
    ],
    createdBy: ["Stephen Butchard"],
    tagline: "Destiny is all",
    keywords: ["vikings", "saxons", "medieval", "war", "historical drama"],
    releaseDate: "2015-10-10",
    isTvShow: true,
    isAdult: true,
  },
  {
    title: "Stranger Things",
    maturityRating: "TV-14",
    contentRating: [
      "supernatural violence",
      "frightening scenes",
      "mild language",
    ],
    cast: [
      "Millie Bobby Brown",
      "Finn Wolfhard",
      "Winona Ryder",
      "David Harbour",
      "Gaten Matarazzo",
    ],
    createdBy: ["The Duffer Brothers"],
    tagline: "The world is turning upside down",
    keywords: [
      "80s nostalgia",
      "supernatural",
      "government conspiracy",
      "friendship",
    ],
    releaseDate: "2016-07-15",
    isTvShow: true,
    isAdult: false,
  },
  {
    title: "The Mandalorian",
    maturityRating: "TV-14",
    contentRating: ["sci-fi violence", "action sequences", "mild language"],
    cast: [
      "Pedro Pascal",
      "Gina Carano",
      "Carl Weathers",
      "Giancarlo Esposito",
      "Werner Herzog",
    ],
    createdBy: ["Jon Favreau"],
    tagline: "Bounty hunting is a complicated profession",
    keywords: ["star wars", "bounty hunter", "baby yoda", "western"],
    releaseDate: "2019-11-12",
    isTvShow: true,
    isAdult: false,
  },
  {
    title: "Breaking Bad",
    maturityRating: "TV-MA",
    contentRating: [
      "drug content",
      "intense violence",
      "strong language",
      "disturbing scenes",
    ],
    cast: [
      "Bryan Cranston",
      "Aaron Paul",
      "Anna Gunn",
      "Dean Norris",
      "Bob Odenkirk",
    ],
    createdBy: ["Vince Gilligan"],
    tagline: "All hail the king",
    keywords: ["meth", "drug empire", "transformation", "crime"],
    releaseDate: "2008-01-20",
    isTvShow: true,
    isAdult: true,
  },
  {
    title: "The Crown",
    maturityRating: "TV-MA",
    contentRating: ["adult themes", "political intrigue", "historical smoking"],
    cast: [
      "Claire Foy",
      "Olivia Colman",
      "Imelda Staunton",
      "Matt Smith",
      "Tobias Menzies",
    ],
    createdBy: ["Peter Morgan"],
    tagline: "The story behind the throne",
    keywords: [
      "royal family",
      "british monarchy",
      "historical",
      "queen elizabeth",
    ],
    releaseDate: "2016-11-04",
    isTvShow: true,
    isAdult: true,
  },
];

export const DEFAULT_PROFILE_AVATAR =
  "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png";
