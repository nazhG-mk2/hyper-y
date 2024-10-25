import projectsIcon from '../assets/projects.svg'
import paperIcon from '../assets/paper.svg'
import Line from '../componets/common/Line'
import CommonFooter from '../componets/common/CommonFooter'

const Dashboard = () => {
    return (
        <section className="flex flex-col gap-2 my-4 font-poppins">
            <h3 className="text-xl text-center font-semibold mb-2">
                Dashboard
            </h3>
            <p className="flex gap-2 px-6">
                <img src={projectsIcon} alt="" />
                <span className='font-medium'>Projects</span>
            </p>
            <ul className="px-10 grid gap-2 font-light">
                <li className="flex">
                    <span className="w-5/6"></span>
                    <span className="w-1/6 text-secondary text-sm text-center">Progress</span>
                </li>
                <li className="flex items-start">
                    <span className="w-5/6 flex gap-2">
                        <span className="bg-yellow rounded-full flex w-2 h-2 px-1 mt-2">
                        </span>Youth for Peace December 2024</span>
                    <progress className="w-1/6 mt-2 progress progress-warning" value="50" max="100">
                    </progress>
                </li>
                <li className="flex ">
                    <span className="w-5/6 flex gap-2">
                        <span className="bg-[#E94235] rounded-full flex w-2 h-2 px-1 mt-2">
                        </span>Sustainability Conference May 2025</span>
                    <progress className="w-1/6 progress progress-error mt-2" value="25" max="100">
                    </progress>
                </li>
                <li className="flex ">
                    <span className="w-5/6 flex gap-2">
                        <span className="bg-[#1A77F2] rounded-full flex w-2 h-2 px-1 mt-2">
                        </span>Music for Love Concert August 2025</span>
                    <progress className="w-1/6 progress progress-info mt-2" value="0" max="100">
                    </progress>
                </li>
            </ul>
            <Line />
            <p className="flex gap-2 px-6 mb-4">
                <img src={paperIcon} alt="" />
                <span className='font-medium'>Music for Love Concert August 2025</span>
            </p>
            <div className="overflow-x-auto w-screen mb-8">
                <table className="table w-auto mx-6">
                    <thead>
                        <tr className="border-0 text-sm text-black">
                            <th>Task</th>
                            <th>Asignee</th>
                            <th>Delivery date</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        <tr className="border-b border-secondary border-opacity-15">
                            <td>Brief</td>
                            <td>
                                <p className='flex items-center gap-2'>
                                    <div className="avatar placeholder">
                                        <div className="bg-emerald-600 text-white w-7 rounded-full">
                                            <span className="text-xs">G</span>
                                        </div>
                                    </div>
                                    Greg
                                </p>
                            </td>
                            <td>25/01/2025</td>
                            <td>Not Started</td>
                        </tr>
                        <tr>
                            <td>Review Proposal</td>
                            <td>
                                <p className='flex items-center gap-2'>
                                    <div className="avatar placeholder">
                                        <div className="bg-red-500 text-white w-7 rounded-full">
                                            <span className="text-xs">A</span>
                                        </div>
                                    </div>
                                    Amy
                                </p>
                            </td>
                            <td>30/01/2025</td>
                            <td>Not Started</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <CommonFooter />
        </section>
    )
}

export default Dashboard
