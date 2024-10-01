import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import LittleWins from './LittleWins';
import { supabase } from "../lib/supabase";
import History from './History';
import DashboardLayout from '../layouts/DashboardLayout';

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
        <DashboardLayout name={name}>
            <div className='max-w-screen-sm flex flex-col gap-16'>
                <LittleWins userId={currentUserId} tasks={tasks} handleUpdateTask={updateTasks} />
                <a href='/course' className='bg-base-200 font-bold w-full p-8 flex flex-col gap-8 rounded-2xl text-4xl cursor-pointer '>View course</a>
                <div className='flex flex-col gap-4'>
                    <h1 className="font-bold text-2xl">Past Small Wins</h1>
                    <History tasks={tasks} />
                </div>

            </div>
        </DashboardLayout>
    )
}

export default Dashboard