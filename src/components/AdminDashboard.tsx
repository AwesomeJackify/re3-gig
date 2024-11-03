import React, { useEffect, useState } from "react";
import { supabase_admin } from "../lib/supabase_admin";
import { Icon } from "@iconify/react";
import History from "./history/History";
import DashboardLayout from "../layouts/DashboardLayout";

interface Props {
  currentUserId: string | undefined;
  name: string;
}

const AdminDashboard = ({ currentUserId, name }: Props) => {
  const [users, setUsers] = useState<any>([]);
  const [currentClientId, setCurrentClientId] = useState<string>("");
  const [tasks, setTasks] = useState<any>([]);
  const [bigGoals, setBigGoals] = useState<BigGoals>();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentClientId) {
        return;
      }
      const { data: todosData, error: todosError } = await supabase_admin
        .from("todos")
        .select()
        .eq("user_id", currentClientId);

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
  }, [currentClientId]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Step 1: Fetch user IDs from `stripe_customers`
      const { data: stripeCustomers, error: stripeError } = await supabase_admin
        .from("stripe_customers")
        .select();

      if (stripeError) throw stripeError;

      const stripeCustomersNonAdmin = stripeCustomers.filter(x => x.customer_id !== null);

      // Extract user IDs from the results
      const userIds =
        stripeCustomersNonAdmin?.map((customer) => customer.user_id) || [];

      if (userIds.length > 0) {
        // Step 2: Fetch user details from `auth.users` for the user IDs in `stripe_customers`
        const { data: users, error: usersError } =
          await supabase_admin.auth.admin.listUsers();

        if (usersError) throw usersError;

        const usersWithStripe = users.users?.filter((user: any) =>
          userIds.includes(user.id)
        );

        // Now you have `users` with details only for those who exist in `stripe_customers`
        setUsers(usersWithStripe);
      }
    };

    fetchUsers();
  }, []);

  const handleOnClick = (currentClientId: string, index: number) => {
    setCurrentClientId(currentClientId);
    (
      document.getElementById(`my_modal_${index}`) as HTMLDialogElement
    ).showModal();
  };

  useEffect(() => {
    if (!currentClientId) {
      return;
    }
    const fetchBigGoals = async () => {
      const { data, error } = await supabase_admin
        .from("big_goals")
        .select()
        .eq("user_id", currentClientId)
        .limit(1);

      if (data && data.length > 0) {
        setBigGoals(data[0]);
      }
    }

    fetchBigGoals();
  }, [currentClientId])

  return (
    <DashboardLayout name={name} showSettings={true} showCourse>
      <section className="max-w-screen-sm mx-auto w-full flex flex-col gap-8 px-4">
        <h1 className="text-4xl underline">My clients</h1>
        <div className="overflow-x-auto">
          <table className="table table-lg">
            {/* head */}
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any, index: number) => (
                <tr
                  key={index}
                  onClick={() => handleOnClick(user.id, index)}
                  className="hover:bg-base-200 cursor-pointer transition"
                >
                  <td>{index + 1}</td>
                  <td>
                    {user.user_metadata.first_name}{" "}
                    {user.user_metadata.last_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {users.map((user: any, index: number) => (
        <dialog
          id={`my_modal_${index}`}
          className="modal max-md:modal-bottom"
          key={"modal" + index}
        >
          <div className="modal-box flex flex-col gap-4">
            <h3 className="font-bold text-2xl capitalize">
              {user.user_metadata.first_name}'s progress
            </h3>
            <div>
              {
                bigGoals ? (
                  <div>
                    <h4 className="font-medium text-lg">Big Goals</h4>
                    <p>{bigGoals?.big_goals}</p>
                  </div>
                ) : <p>No big goals yet...</p>
              }

            </div>
            <hr />
            <div className="flex flex-col gap-2">
              {
                tasks.length > 0 && (
                  <h4 className="font-medium text-lg">Small Wins</h4>
                )
              }
              <History timeframe="last7days" tasks={tasks} isAdmin={true} />

            </div>
            <form method="dialog" className="modal-backdrop">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </dialog>
      ))}
    </DashboardLayout>
  );
};

export default AdminDashboard;
