import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  StyleSheet,
  ImageBackground
} from "react-native";
import { useLoginViewModel } from "../../viewmodels/general/LoginViewModel";

const LogIn = ({ navigation }) => {
  const { email, setEmail, password, setPassword, handleLogin } = useLoginViewModel(navigation);

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Image
            source={require("../../assets/logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Iniciar Sesión</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.blackButton} onPress={handleLogin}>
            <Text style={styles.blackButtonText}>INGRESAR</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>

            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  box: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 10,
    width: "85%",
    alignItems: "center"
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },
  input: {
    width: "100%",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ccc"
  },
  blackButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: "100%",
    marginTop: 10
  },
  blackButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },
  registerText: {
    marginTop: 15,
    color: "#2e86de",
    textAlign: "center",
    textDecorationLine: "underline"
  }
});

export default LogIn;
