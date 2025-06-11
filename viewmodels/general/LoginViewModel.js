import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../../services/firebaseConfig";
import { fetchCurrentUserData } from "../../services/userService";

export const useLoginViewModel = (navigation) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const userData = await fetchCurrentUserData();

      if (userData.rol === "cafeteria") {
        navigation.replace("HomeCafeteria");
      } else if (userData.rol === "alumno") {
        navigation.replace("HomeAlumno");
      } else {
        alert("Rol no autorizado.");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return { email, setEmail, password, setPassword, handleLogin };
};
