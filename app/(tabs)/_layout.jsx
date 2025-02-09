import {useGlobalContext} from "../../context/GlobalProvider";
import {Redirect, Tabs} from "expo-router";

const TabLayout = () => {
    const {isLogged} = useGlobalContext();

    if(!isLogged) return <Redirect href="/login" />;

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#FFA001",
                    tabBarInactiveTintColor: "#CDCDE0",
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        backgroundColor: "#161622",
                        borderTopWidth: 1,
                        borderTopColor: "#232533",
                        height: 84,
                    },
                }}>
                <Tabs.Screen
                    name="add-file"
                    options={{
                        title: "Add File",
                        headerShown: true
                    }}
                />
                <Tabs.Screen
                    name="my-files"
                    options={{
                        title: "My Files",
                        headerShown: true
                    }}
                />
                <Tabs.Screen
                    name="sent-files"
                    options={{
                        title: "Sent Files",
                        headerShown: true
                    }}
                />
            </Tabs>
        </>
    );
}

export default TabLayout;
