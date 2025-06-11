import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../services/firebaseConfig";
import { fetchCurrentUserData } from "../../services/userService";

const Start = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const check = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const data = await fetchCurrentUserData();
        if (data.rol === "cafeteria") navigation.replace("HomeCafeteria");
        else navigation.replace("LogIn");
      } else navigation.replace("LogIn");
    };
    check();
  }, []);

  return null;
};

export default Start;
