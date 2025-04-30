import React from "react";
import Navbar from "@/components/Navbar";
import MovieList from "@/components/MovieList";
import useFavourites from "@/hooks/useFavourites";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import useProfile from "@/hooks/useProfile";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const MyList = () => {
  const { currentProfileId } = useProfile();
  const { data: favourites = [], isLoading } = useFavourites(
    currentProfileId || undefined
  );

  if (isLoading || currentProfileId === null) {
    return (
      <div>
        <Navbar />
        <div className="pt-20 px-4 md:px-16 pb-40">
          <p className="text-white text-lg">Loading your list...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h1 className="text-white text-3xl font-bold mt-8 mb-6">My List</h1>
        {favourites.length === 0 ? (
          <div>
            <p className="text-white text-lg font-bold">
              No movies in your list
            </p>
          </div>
        ) : (
          <MovieList title="My List" data={favourites || []} />
        )}
      </div>
    </div>
  );
};

export default MyList;
