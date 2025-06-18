import { useState, useRef } from 'react';
import { 
  BarcodeScanner, 
  BarcodeFormat,
  type PluginListenerHandle 
} from '@capacitor-mlkit/barcode-scanning';
import { useToast } from "@/hooks/use-toast";

export const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const listenerRef = useRef<PluginListenerHandle | null>(null);

  const checkPermissions = async (): Promise<boolean> => {
    try {
      // Verifica se il dispositivo supporta la scansione
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        toast({
          title: "Scanner non supportato",
          description: "Questo dispositivo non supporta la scansione di codici a barre",
          variant: "destructive"
        });
        return false;
      }

      // Controlla i permessi attuali
      const { camera } = await BarcodeScanner.checkPermissions();
      
      if (camera === 'granted') {
        return true;
      }
      
      if (camera === 'denied') {
        // Prova a richiedere i permessi
        const { camera: newPermission } = await BarcodeScanner.requestPermissions();
        
        if (newPermission === 'granted') {
          return true;
        }
        
        toast({
          title: "Permesso fotocamera negato",
          description: "Abilita i permessi della fotocamera nelle impostazioni dell'app",
          variant: "destructive"
        });
        return false;
      }
      
      if (camera === 'restricted') {
        toast({
          title: "Fotocamera limitata",
          description: "L'accesso alla fotocamera è limitato su questo dispositivo",
          variant: "destructive"
        });
        return false;
      }

      // Per altri stati (unknown, etc.)
      toast({
        title: "Fotocamera non disponibile",
        description: "Non è possibile accedere alla fotocamera in questo momento",
        variant: "destructive"
      });
      return false;
      
    } catch (error) {
      console.error('Errore controllo permessi:', error);
      toast({
        title: "Errore permessi",
        description: "Errore durante il controllo dei permessi della fotocamera",
        variant: "destructive"
      });
      return false;
    }
  };

  const startScan = async (): Promise<string | null> => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        return null;
      }

      setIsScanning(true);

      // Opzione 1: Usa l'interfaccia ready-to-use (più semplice)
      const { barcodes } = await BarcodeScanner.scan({
        formats: [
          BarcodeFormat.QrCode,
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.Code128,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.Codabar,
          BarcodeFormat.DataMatrix,
          BarcodeFormat.Pdf417,
          BarcodeFormat.Aztec
        ]
      });

      if (barcodes && barcodes.length > 0) {
        const scannedCode = barcodes[0].rawValue;
        console.log('Codice scansionato:', scannedCode);
        return scannedCode;
      }
      
      return null;
      
    } catch (error) {
      console.error('Errore durante la scansione:', error);
      
      // Gestisci diversi scenari di errore
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          // L'utente ha annullato la scansione
          return null;
        }
        
        if (error.message.includes('permission')) {
          toast({
            title: "Permessi mancanti",
            description: "Permessi della fotocamera necessari per la scansione",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Errore scansione",
            description: error.message || "Si è verificato un errore durante la scansione",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Errore scansione",
          description: "Si è verificato un errore sconosciuto durante la scansione",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  // Versione alternativa con controllo personalizzato dell'UI
  const startScanWithCustomUI = async (): Promise<string | null> => {
    return new Promise(async (resolve) => {
      try {
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
          resolve(null);
          return;
        }

        setIsScanning(true);

        // Nasconde gli elementi dell'interfaccia per mostrare la fotocamera
        document.body.classList.add('barcode-scanner-active');

        // Aggiungi listener per i codici scansionati
        listenerRef.current = await BarcodeScanner.addListener(
          'barcodeScanned',
          async (result) => {
            console.log('Codice scansionato:', result.barcode.rawValue);
            await stopScan();
            resolve(result.barcode.rawValue);
          }
        );

        // Avvia la scansione
        await BarcodeScanner.startScan();
        
      } catch (error) {
        console.error('Errore durante la scansione:', error);
        await stopScan();
        
        toast({
          title: "Errore scansione",
          description: "Si è verificato un errore durante la scansione",
          variant: "destructive"
        });
        
        resolve(null);
      }
    });
  };

  const stopScan = async () => {
    try {
      // Rimuovi listener se esistente
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      
      // Ferma la scansione
      await BarcodeScanner.stopScan();
      
      // Ripristina gli elementi dell'interfaccia
      document.body.classList.remove('barcode-scanner-active');
      
      setIsScanning(false);
    } catch (error) {
      console.error('Errore durante lo stop della scansione:', error);
      // Assicurati che lo stato venga comunque resettato
      setIsScanning(false);
      document.body.classList.remove('barcode-scanner-active');
    }
  };

  // Metodo per scansionare da un'immagine esistente
  const scanFromImage = async (imagePath: string): Promise<string | null> => {
    try {
      const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        path: imagePath,
        formats: [
          BarcodeFormat.QrCode,
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.Code128
        ]
      });

      if (barcodes && barcodes.length > 0) {
        return barcodes[0].rawValue;
      }
      
      return null;
    } catch (error) {
      console.error('Errore scansione da immagine:', error);
      toast({
        title: "Errore scansione immagine",
        description: "Impossibile leggere codici a barre dall'immagine selezionata",
        variant: "destructive"
      });
      return null;
    }
  };

  // Metodo per verificare se il modulo Google Barcode Scanner è disponibile
  const checkGoogleModule = async (): Promise<boolean> => {
    try {
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      return available;
    } catch (error) {
      console.error('Errore controllo modulo Google:', error);
      return false;
    }
  };

  // Metodo per installare il modulo Google Barcode Scanner se necessario
  const installGoogleModule = async (): Promise<boolean> => {
    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
      return true;
    } catch (error) {
      console.error('Errore installazione modulo Google:', error);
      toast({
        title: "Errore installazione",
        description: "Impossibile installare il modulo di scansione",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isScanning,
    startScan,
    startScanWithCustomUI,
    stopScan,
    checkPermissions,
    scanFromImage,
    checkGoogleModule,
    installGoogleModule
  };
};
