import { logger } from "@/utils/logger";
import ProfileItem from "@/components/profile/profileEdit";
import { AddressManager } from "@/components/profile/AddressManager";
import { getMyAddresses } from "@/app/actions/address.actions";
import { getProfile } from "@/app/actions/profile.actions";

export default async function myAccount() {

    const [profile, addresses] = await Promise.all([
        getProfile(),
        getMyAddresses(),
    ]);
    // logger.info("Profile: " + JSON.stringify(profile, null, 2))
    // logger.info("Addresses: " + JSON.stringify(addresses, null, 2))
    const profileList = {
        email: { value: profile.email, editable: false },
        bio: { value: profile.profile.bio, editable: true, field: "bio" as const },
        age: { value: profile.age.toString(), editable: false },
        phone: { value: profile.profile.phone, editable: true, field: "phone" as const },
    }
    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Account</h1>
            <p className="text-gray-500 mb-8">Your profile and address detail</p>
            <ProfileContainer heading="Set your profile">
                {Object.entries(profileList).map(([listname, data]) => (
                    <ProfileItem
                        key={listname}
                        name={listname}
                        value={data.value}
                        editable={data.editable}
                        field={"field" in data ? data.field : undefined}
                    />
                ))}
            </ProfileContainer>
            <AddressContainer heading="Set your address">
                <AddressManager addresses={addresses} />
            </AddressContainer>
        </div>
    )
}

async function ProfileContainer({ children, heading }: { children: React.ReactNode, heading: string }) {
    return (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-8">
            <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-500 mb-4">{heading}</h2>
                {children}
            </div>
        </div>
    )
}
async function AddressContainer({ children, heading }: { children?: React.ReactNode, heading: string }) {
    return (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-8">
            <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-500 mb-4">{heading}</h2>
                {children}
            </div>
        </div>
    )
}