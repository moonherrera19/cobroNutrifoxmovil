import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIRESTORE_DB } from "./firebaseConfig";

// ✅ Registrar cobro de beca
export const registrarCobroBeca = async (alumno) => {
  try {
    if (
      !alumno ||
      !alumno.numero_control ||
      !alumno.nombre ||
      !alumno.carrera
    ) {
      throw new Error("Datos del alumno incompletos o inválidos.");
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioDia = Timestamp.fromDate(hoy);

    const becasRef = collection(FIRESTORE_DB, "becas");
    const q = query(
      becasRef,
      where("numero_control", "==", alumno.numero_control),
      where("fecha", ">=", inicioDia)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error("Este alumno ya recibió su beca hoy.");
    }

    await addDoc(becasRef, {
      numero_control: alumno.numero_control,
      nombre: alumno.nombre,
      carrera: alumno.carrera,
      estado: "recibida",
      fecha: Timestamp.now()
    });
  } catch (error) {
    console.error("❌ Error al registrar cobro:", error.message);
    throw error;
  }
};

// ✅ Obtener datos del usuario autenticado
export const fetchCurrentUserData = async () => {
  try {
    const user = getAuth().currentUser;
    if (!user || !user.email) {
      throw new Error("Usuario no autenticado o sin correo.");
    }

    const q = query(
      collection(FIRESTORE_DB, "user"),
      where("email", "==", user.email)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error("Usuario no encontrado en Firestore");
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error.message);
    throw error;
  }
};
