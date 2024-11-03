import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase';

interface Props {
    userId: string | undefined;
}

const BigGoals = ({ userId }: Props) => {
    const [textArea, setTextArea] = useState("");
    const [bigGoals, setBigGoals] = useState<BigGoals>();
    const [isSaving, setIsSaving] = useState(false);
    const [showNotSaved, setShowNotSaved] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("big_goals")
                .select()
                .eq("user_id", userId)
                .limit(1);

            if (data && data.length > 0) {
                setBigGoals(data[0]);
                setTextArea(data[0].big_goals);
            }
        };

        fetchData();
    }, [])

    const handleBlur = () => {
        if (textArea != bigGoals?.big_goals) {
            setShowNotSaved(true);
        } else {
            setShowNotSaved(false);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setShowNotSaved(false);

        if (bigGoals) {
            const { data, error } = await supabase
                .from("big_goals")
                .update({
                    big_goals: textArea,
                })
                .eq("id", bigGoals.id);

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
            const { error } = await supabase.from("big_goals").insert({
                user_id: userId,
                big_goals: textArea,
            });
        }
        setIsSaving(false);

    };


    return (
        <div>
            <button className="btn max-md:btn-xs btn-primary" onClick={() => {
                const modal = document.getElementById('my_modal_1');
                if (modal) {
                    (modal as HTMLDialogElement).showModal();
                }
            }}>My Big Goals</button>
            <dialog id="my_modal_1" className="modal max-md:modal-bottom">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">My Big Goals</h3>
                    <textarea
                        name="bigGoals"
                        id="bigGoals"
                        placeholder="My big goals are..."
                        value={textArea}
                        className="p-4 my-4 max-md:h-44 w-full border rounded-2xl h-full resize-none bg-white text-black"
                        onChange={(e) => setTextArea(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault(); // Prevents adding a new line
                                handleSubmit(); // Trigger save
                            }
                        }}
                    ></textarea>
                    <div className="flex ml-auto gap-2 justify-between w-full">
                        <div>
                            {showNotSaved && (
                                <span className="text-sm font-light">
                                    Your big goals are not saved!
                                </span>
                            )}
                        </div>
                        <button
                            className="w-fit btn btn-primary self-end btn-sm"
                            onClick={handleSubmit}
                            type="submit"
                        >
                            {isSaving ? (
                                <span className="loading loading-spinner loading-md text-white"></span>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default BigGoals