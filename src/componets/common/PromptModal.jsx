import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { GlobalContext } from "../../contexts/Global";

const PromptModal = ({ open, setOpen }) => {
    const modalRef = useRef(null);
    const { state, setPrompt } = GlobalContext();
    const [tempPrompt, setTempPrompt] = useState(state.prompt || "");

    useEffect(() => {
        setTempPrompt(state.prompt || "");
    }, [state.prompt]);

    const handleSave = () => {
        setPrompt(tempPrompt);
        setOpen(false);
    };

    if (!open) return null;

    return (
        <dialog open ref={modalRef} className="modal modal-open">
            <div className="modal-box bg-slate-50">
                <h3 className="font-bold text-lg mb-2">Edit System Prompt</h3>
                <textarea
                    className="textarea textarea-bordered w-full h-32 mb-4 bg-slate-200"
                    value={tempPrompt}
                    onChange={e => setTempPrompt(e.target.value)}
                />
                <div className="modal-action">
                    <button className="btn bg-secondary-content hover:bg-stone-300 !rounded-full text-black" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="btn btn-primary hover:bg-dark !rounded-full text-white" onClick={handleSave}>Save</button>
                </div>
            </div>
        </dialog>
    );
};
PromptModal.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};

export default PromptModal;
