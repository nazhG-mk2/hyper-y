import SettingsMobile from './SettingsMobile';
import ModelUsageCharts from '../componets/common/ModelUsageCharts';

const Settings = () => {
    return (
        <>
            <SettingsMobile />
            <div className="flex flex-col gap-4 px-16 py-8 md:hidden overflow-y-auto h-[90dvh]">
                <h2 className="font-semibold text-lg">Account Settings</h2>
                <hr className="w-10 border-primary border" />
                <div className="flex flex-col gap-6 bg-stone-100 p-4 rounded-lg">
                    <div className="flex justify-between">
                        <div className="flex flex-wrap gap-4">
                            <h3 className="font-semibold w-full">Change Profile Picture</h3>
                            <div className="avatar">
                                <div className="w-12 h-12 rounded-full">
                                    <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                </div>
                            </div>
                            <div className="text-sm">
                                <p>Upload a new photo to change your profile picture</p>
                                <p className="text-secondary">Pick a photo up to 2MB in size, 1x1 ratio</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-nowrap">
                            <button className="btn !py-[2px] !px-8 bg-primary border-none text-white hover:bg-dark hover:border-gray-500">Upload new Photo</button>
                            <button className="btn !py-[2px] !px-8 border-primary border bg-transparent text-white hover:bg-primary hover:border-gray-500">Remove Photo</button>
                        </div>
                    </div>
                </div>
                <div className="divider divider-warning w-full"></div>
                <div className="flex flex-wrap gap-6 bg-stone-100 p-4 rounded-lg">
                    <h3 className="font-semibold w-full">Display Name</h3>
                    <p className="w-full">Please write your name and surname</p>
                    <div className="flex gap-4">
                        <input type="text" placeholder="User name" className="w-64 p-2 bg-transparent outline-none border border-primary rounded-md text-center" />
                        <button className="btn !py-6 bg-primary border-none text-white hover:bg-dark hover:border-gray-500 content-center">
                            Save
                        </button>
                    </div>
                </div>
                <div className="divider divider-warning w-full"></div>
                <div className="flex flex-wrap gap-6 bg-stone-100 p-4 rounded-lg">
                    <h3 className="font-semibold w-full">Location</h3>
                    <p className="w-full">Please select your location for more precise chat outputs</p>
                    <div className="flex gap-4">
                        <input type="text" placeholder="Location" className="w-64 p-2 bg-transparent outline-none border border-primary rounded-md text-center" />
                        <button className="btn !py-6 bg-primary border-none text-white hover:bg-dark hover:border-gray-500 content-center">
                            Save
                        </button>
                    </div>
                </div>
                <div className="divider divider-warning w-full"></div>
                <ModelUsageCharts />
            </div>
        </>
    )
}


export default Settings;