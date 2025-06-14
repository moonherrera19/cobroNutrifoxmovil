import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const descargarReporteBecas = async () => {
  try {
    const url = "https://backend-nutrifox.onrender.com/reporte/pdf";
 // URL de tu backend en Render

    const fileUri = FileSystem.documentDirectory + "reporte_becas.pdf";

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri
    );

    const { uri } = await downloadResumable.downloadAsync();

    if (uri) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Descargado", "Reporte guardado en: " + uri);
      }
    }
  } catch (error) {
    console.error("❌ Error al descargar PDF:", error);
    Alert.alert("Error", "No se pudo descargar el reporte.");
  }
};
