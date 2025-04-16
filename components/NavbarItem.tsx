import { useRouter } from "next/router";

interface NavbarItemProps {
  label: string;
  link: string;
}

const NavbarItem = ({ label, link }: NavbarItemProps) => {
  const router = useRouter();
  return (
    <>
      <div
        onClick={() => router.push(link)}
        className="text-white cursor-pointer hover:text-gray-300 transition"
      >
        {label}
      </div>
    </>
  );
};

export default NavbarItem;
