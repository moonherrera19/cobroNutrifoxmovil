import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [numeroControl, setNumeroControl] = useState("");
  const [carrera, setCarrera] = useState("");
  const navigation = useNavigation();

  const esEmailValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const registrarAlumno = async () => {
    try {
      if (!email || !password || !nombre || !numeroControl || !carrera) {
        Alert.alert("Campos incompletos", "Por favor llena todos los campos.");
        return;
      }

      if (!esEmailValido(email)) {
        Alert.alert("Correo inválido", "Ingresa un correo electrónico válido.");
        return;
      }

      const q = query(
        collection(FIRESTORE_DB, "user"),
        where("numero_control", "==", numeroControl)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        Alert.alert(
          "Número de control duplicado",
          "Ya existe un usuario con ese número."
        );
        return;
      }

      await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);

      await addDoc(collection(FIRESTORE_DB, "user"), {
        email,
        nombre,
        numero_control: numeroControl,
        carrera,
        estado_beca: "sin beca",
        rol: "alumno",
      });

      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);

      navigation.replace("HomeAlumno");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../../assets/logo.jpeg")}
          style={styles.logo}
        />
        <View style={styles.card}>
          <Text style={styles.title}>Registro de Alumno</Text>

          <TextInput
            placeholder="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />
          <TextInput
            placeholder="Número de control"
            value={numeroControl}
            onChangeText={setNumeroControl}
            style={styles.input}
          />
          <TextInput
            placeholder="Carrera"
            value={carrera}
            onChangeText={setCarrera}
            style={styles.input}
          />
          <TextInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={registrarAlumno}>
            <Text style={styles.buttonText}>REGISTRARSE</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("LogIn")}>
            <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loginLink: {
    color: "#2e86de",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
