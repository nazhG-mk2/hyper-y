import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import generateMessage from "../../utils/friendlyErrorMsg";

const Error = forwardRef((_, ref) => {
    Error.displayName = "Error";
    const errorRef = useRef(null);

    const [message, setMessage] = useState(generateMessage());

    useImperativeHandle(ref, () => ({
        showError: () => {
            setMessage(generateMessage());
            errorRef.current.showModal();
        },
        hideError: () => {
            errorRef.current.close();
        },
    }));

    return (
        <>
            <dialog ref={errorRef} className="modal">
                <div className="modal-box bg-white">
                    <p className="py-4">{message}</p>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
});

export default Error;
