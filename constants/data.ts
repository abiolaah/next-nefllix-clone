import { MediaItem } from "@/lib/types/api";

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

export const sampleMovies: MediaItem[] = [
  {
    id: "movie1",
    title: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
    thumbnailUrl:
      "https://beam-images.warnermediacdn.com/BEAM_LWM_DELIVERABLES/14552c93-d318-4563-a00b-343df7e35d0b/4beb5159-7570-4f7e-bd37-6f7ea0ccff52?host=wbd-images.prod-vod.h264.io&partner=beamcom",
    trailerUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
    genre: ["Sci-Fi", "Action", "Thriller"],
    rating: 8.8,
    duration: "2h 28m",
    isTvShow: false,
  },
  {
    id: "movie2",
    title: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
    thumbnailUrl:
      "https://images.squarespace-cdn.com/content/5c75dfa97d0c9166551f52b1/1639184505697-PU99E09B8ZDV3RHUHZAC/9964546b0ba1f6e14a6045e34b341f8ca2a3569752c5afed95b89682fcde1a68._RI_V_TTW_.jpg?format=1500w&content-type=image%2Fjpeg",
    trailerUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
    genre: ["Drama"],
    rating: 9.3,
    duration: "2h 22m",
    isTvShow: false,
  },
  {
    id: "movie3",
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
    thumbnailUrl:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    duration: "2h 32m",
    isTvShow: false,
  },
];

export const sampleTvShows: MediaItem[] = [
  {
    id: "tv1",
    title: "Breaking Bad",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    videoUrl: "/videos/breaking-bad.mp4",
    thumbnailUrl: "/images/breaking-bad.jpg",
    trailerUrl: "/trailers/breaking-bad.mp4",
    genre: ["Crime", "Drama", "Thriller"],
    rating: 9.5,
    numberOfSeasons: 5,
    isTvShow: true,
  },
  {
    id: "tv2",
    title: "Stranger Things",
    description:
      "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
    videoUrl: "/videos/stranger-things.mp4",
    thumbnailUrl: "/images/stranger-things.jpg",
    trailerUrl: "/trailers/stranger-things.mp4",
    genre: ["Drama", "Fantasy", "Horror"],
    rating: 8.7,
    numberOfSeasons: 4,
    isTvShow: true,
  },
  {
    id: "tv3",
    title: "The Crown",
    description:
      "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century.",
    videoUrl: "/videos/the-crown.mp4",
    thumbnailUrl: "/images/the-crown.jpg",
    trailerUrl: "/trailers/the-crown.mp4",
    genre: ["Biography", "Drama", "History"],
    rating: 8.7,
    numberOfSeasons: 6,
    isTvShow: true,
  },
];
