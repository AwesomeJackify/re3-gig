import React, { useEffect, useState } from 'react'
import { supabase_admin } from '../lib/supabase_admin';
import { Icon } from '@iconify/react';

interface Props {
    currentUserId: string | undefined;
    name: string;
}

const AdminDashboard = ({ currentUserId, name }: Props) => {
    const [users, setUsers] = useState<any>([])

    useEffect(() => {
        const fetchData = async () => {
            const { data: { users }, error } = await supabase_admin.auth.admin.listUsers()
            setUsers(users)
        }

        fetchData()
    })

    return (
        <div className='flex flex-col gap-16'>
            <nav
                className="absolute items-center top-0 left-0 w-full p-8 flex justify-between max-md:p-4"
            >
                <a href="#">
                    <Icon
                        icon="mdi:account-circle"
                        className="text-6xl hover:text-primary transition"
                    />
                </a>
                <form action="/api/auth/signout" method="get">
                    <button type="submit" className="btn btn-primary btn-sm">Sign out</button>
                </form>
            </nav>
            <section className="max-w-screen-xl mx-auto pt-32 flex flex-col gap-16 px-4">
                <h1 className="font-bold text-6xl max-md:text-center">Hey, {name}!</h1>
            </section>
            <section className='max-w-screen-lg mx-auto w-full flex flex-col gap-8 px-4'>
                <h1 className='text-4xl underline'>My clients</h1>
                <div className='grid grid-cols-2 max-md:grid-cols-1 gap-8'>

                    {
                        users.map((user: any, index: number) => (
                            user.id != currentUserId &&
                            (
                                <div>
                                    <button onClick={() => (document.getElementById(`my_modal_${index}`) as HTMLDialogElement).showModal()} key={user.id} className='w-full py-8 px-4 pt-4 shadow-2xl rounded-2xl border-black border-4 hover:bg-black transition cursor-pointer hover:text-primary'>
                                        <h1 className='text-4xl font-bold text-center'>{user.user_metadata.first_name} {user.user_metadata.last_name} </h1>
                                    </button>
                                    <dialog id={`my_modal_${index}`} className="modal">
                                        <div className="modal-box">
                                            <h3 className="font-bold text-lg">{user.user_metadata.first_name}'s small wins</h3>

                                            <form method="dialog" className='modal-backdrop'>
                                                {/* if there is a button in form, it will close the modal */}
                                                <button className="btn">Close</button>
                                            </form>

                                        </div>
                                    </dialog>
                                </div>
                            )
                        ))
                    }
                </div>
            </section>
        </div>
    )
}

export default AdminDashboard