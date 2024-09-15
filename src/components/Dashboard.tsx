import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import LittleWins from './LittleWins';
import { supabase } from "../lib/supabase";
import History from './History';

interface Props {
    currentUserId: string | undefined;
    name: string;
}

const Dashboard = ({ currentUserId, name }: Props) => {
    const [tasks, setTasks] = useState<
        Task[]
    >([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: todosData, error: todosError } = await supabase
                .from("todos")
                .select()
                .eq("user_id", currentUserId)

            if (todosData) {
                const tasks = todosData.map((task) => {
                    return {
                        id: task.id,
                        name: task.name,
                        is_complete: task.is_complete,
                        created_at: task.created_at,
                    };
                });

                setTasks(tasks);
            }
        };

        fetchData();
    }, []);

    const updateTasks = (tasks: Task[]) => {
        setTasks(tasks);
    }

    return (
        <div>
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
                <div className='max-w-screen-sm flex flex-col gap-16'>
                    <LittleWins userId={currentUserId} tasks={tasks} handleUpdateTask={updateTasks} />
                    <History tasks={tasks} />
                </div>
            </section>
        </div>
    )
}

export default Dashboard