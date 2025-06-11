import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../services/firebaseConfig";

export const useCafeteriaViewModel = () => {
  const [numeroControl, setNumeroControl] = useState("");
  const [alumno, setAlumno] = useState(null);

  const buscarAlumno = async () => {
    const q = query(collection(FIRESTORE_DB, "user"), where("numero_control", "==", numeroControl));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) setAlumno(snapshot.docs[0].data());
    else setAlumno(null);
  };

  const resetear = () => {
    setNumeroControl("");
    setAlumno(null);
  };

  return { numeroControl, setNumeroControl, alumno, buscarAlumno, resetear };
};
