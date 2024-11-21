import React, { useEffect, useState } from 'react';
import { BsSearch } from "react-icons/bs";
import Loading from './Loading';
import UserSearchCard from './userSearchCard'; 
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoMdClose } from "react-icons/io";

const SearchUser = ({onClose}) => {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearchUser = async () => {
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/search-user`;
    try {
      setLoading(true);
      const response = await axios.post(URL, { search: search });
      setLoading(false);
      setSearchUser(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    handleSearchUser();
  }, [search]);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10">
      <div className="w-full max-w-lg mx-auto mt-10 m-2">
        <div className="bg-white rounded h-14 overflow-hidden flex">
          <input
            type="text"
            placeholder="Search user by name"
            className="w-full outline-none py-1 h-full px-4"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <div className="h-14 w-14 flex justify-center items-center">
            <BsSearch size={25} />
          </div>
        </div>

        {/* Display search user results */}
        <div className="bg-white mt-2 w-full p-4 rounded">
          {/* Search user not found */}
          {searchUser.length === 0 && !loading && (
            <p className="text-center text-slate-500">No user found</p>
          )}

          {/* Loading state */}
          {loading && (
            <p><Loading /></p>
          )}

          {searchUser.length !== 0 && !loading && (
            searchUser.map((user, index) => (
              <UserSearchCard key={user._id} user={user} onClose={onClose}/> 
            ))
          )}
        </div>
      </div>

      <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={onClose}>
        <button>
          <IoMdClose/>
        </button>
      </div>

    </div>
  );
};

export default SearchUser;
