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

export const DEFAULT_PROFILE_AVATAR =
  "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png";
