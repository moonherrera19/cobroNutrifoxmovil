import { collection, addDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../services/firebaseConfig";

export const insertarUsuariosEjemplo = async () => {
  const usuarios = [
    {
      nombre: "Juan Pérez",
      email: "juan@correo.com",
      numero_control: "2130001",
      carrera: "Sistemas",
      estado_beca: "becario",
      rol: "alumno"
    },
    {
      nombre: "Cafetería",
      email: "cafeteria@correo.com",
      numero_control: "0000000",
      carrera: "-",
      estado_beca: "-",
      rol: "cafeteria"
    }
  ];

  for (const user of usuarios) {
    await addDoc(collection(FIRESTORE_DB, "users"), user);
  }

  console.log("Usuarios insertados");
};
