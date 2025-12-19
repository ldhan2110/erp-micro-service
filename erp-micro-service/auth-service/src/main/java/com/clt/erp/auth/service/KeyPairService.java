package com.clt.erp.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Service to manage RSA key pair persistence.
 * Loads existing key pair from file or generates and saves a new one.
 */
@Slf4j
@Service
public class KeyPairService {
    
    private static final String KEY_ID = "jwt-key-id"; // Fixed key ID for consistency
    
    @Value("${jwt.key-pair.path:./keys/jwt-keypair.pem}")
    private String keyPairPath;
    
    /**
     * Get or create RSA key pair.
     * If key pair file exists, loads it. Otherwise, generates a new one and saves it.
     * 
     * @return RSA KeyPair
     */
    public KeyPair getOrCreateKeyPair() {
        Path keyPath = Paths.get(keyPairPath);
        
        // Try to load existing key pair
        if (Files.exists(keyPath)) {
            try {
                KeyPair keyPair = loadKeyPair(keyPath);
                log.info("Loaded existing RSA key pair from: {}", keyPairPath);
                return keyPair;
            } catch (Exception e) {
                log.warn("Failed to load existing key pair from {}: {}. Generating new key pair.", 
                        keyPairPath, e.getMessage());
            }
        }
        
        // Generate new key pair
        KeyPair keyPair = generateRsaKeyPair();
        
        // Save the new key pair
        try {
            saveKeyPair(keyPair, keyPath);
            log.info("Generated and saved new RSA key pair to: {}", keyPairPath);
        } catch (Exception e) {
            log.error("Failed to save key pair to {}: {}", keyPairPath, e.getMessage());
            throw new IllegalStateException("Failed to save RSA key pair", e);
        }
        
        return keyPair;
    }
    
    /**
     * Get the fixed key ID for the RSA key
     */
    public String getKeyId() {
        return KEY_ID;
    }
    
    /**
     * Generate a new RSA key pair
     */
    private KeyPair generateRsaKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("RSA algorithm not available", e);
        }
    }
    
    /**
     * Load RSA key pair from file
     */
    private KeyPair loadKeyPair(Path keyPath) throws Exception {
        try (BufferedReader reader = Files.newBufferedReader(keyPath)) {
            String privateKeyBase64 = reader.readLine();
            String publicKeyBase64 = reader.readLine();
            
            if (privateKeyBase64 == null || publicKeyBase64 == null) {
                throw new IOException("Invalid key pair file format");
            }
            
            // Decode private key
            byte[] privateKeyBytes = Base64.getDecoder().decode(privateKeyBase64);
            PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey privateKey = keyFactory.generatePrivate(privateKeySpec);
            
            // Decode public key
            byte[] publicKeyBytes = Base64.getDecoder().decode(publicKeyBase64);
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
            PublicKey publicKey = keyFactory.generatePublic(publicKeySpec);
            
            return new KeyPair(publicKey, privateKey);
        }
    }
    
    /**
     * Save RSA key pair to file
     */
    private void saveKeyPair(KeyPair keyPair, Path keyPath) throws Exception {
        // Create parent directories if they don't exist
        Files.createDirectories(keyPath.getParent());
        
        // Encode keys to Base64
        String privateKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());
        String publicKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
        
        // Write to file
        try (BufferedWriter writer = Files.newBufferedWriter(keyPath)) {
            writer.write(privateKeyBase64);
            writer.newLine();
            writer.write(publicKeyBase64);
        }
        
        // Set file permissions to be readable/writable only by owner (Unix-like systems)
        try {
            keyPath.toFile().setReadable(false, false);
            keyPath.toFile().setWritable(false, false);
            keyPath.toFile().setReadable(true, true);
            keyPath.toFile().setWritable(true, true);
        } catch (Exception e) {
            log.warn("Could not set file permissions on key pair file: {}", e.getMessage());
        }
    }
}
