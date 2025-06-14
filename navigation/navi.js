import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Start from "../views/general/Start";
import LogIn from "../views/general/Log_In";
import HomeCafeteria from "../views/workers/HomeCafeteria";
import HomeAlumno from "../views/alumnos/HomeAlumno";
import RegisterScreen from "../views/general/RegisterScreen";
import HomeAdmin from "../views/admin/HomeAdmin";

const Stack = createNativeStackNavigator();

const Navigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Start" component={Start} />
    <Stack.Screen name="LogIn" component={LogIn} />
    <Stack.Screen name="HomeCafeteria" component={HomeCafeteria} />
    <Stack.Screen name="HomeAlumno" component={HomeAlumno} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="HomeAdmin" component={HomeAdmin} /> 

  </Stack.Navigator>
);

export default Navigation;
