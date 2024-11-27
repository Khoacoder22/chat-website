import React from 'react'
import Avatar from './Avatar'
import {Link} from 'react-router-dom'

const UserSearchCard = ({user, onClose}) => {
  return (
    <Link to={"/"+user?._id} onClick={onClose} className='flex items-center gap-3 p-2 lg:p-4 border border-transparent border-t-slate-200 hover:border-blue-500 rounded cursor-pointer'>
      <div>
        <Avatar width={40} height={40} name={user?.name} UserId={user?._id} imageUrl={user?.profile_pic}/>
      </div>
      <div>
        <div className='font-semibold text-sm-text-ellips line-clamp-1'>
          {user?.name}
        </div>
        <p className='text-sm-text-ellips line-clamp-1'>{user?.email}</p>
      </div>
    </Link>
  )
}

export default UserSearchCard