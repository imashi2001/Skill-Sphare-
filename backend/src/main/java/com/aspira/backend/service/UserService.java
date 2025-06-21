package com.aspira.backend.service;

import com.aspira.backend.dto.UserDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${media.upload-dir}")
    private String baseUploadDir;

    @Transactional
    // Create a new user
    // Check if the username or email already exists before creating a new user
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setName(userDTO.getName() != null ? userDTO.getName() : userDTO.getUsername());
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setOccupation(userDTO.getOccupation());
        user.setBirthday(userDTO.getBirthday());
        user.setProfileImage(userDTO.getProfileImage());
        user.setCountry(userDTO.getCountry());
        user.setCity(userDTO.getCity());
        user.setPostalCode(userDTO.getPostalCode());

        String provider = (userDTO.getProvider() == null || userDTO.getProvider().isBlank()) ? "local"
                : userDTO.getProvider();
        user.setProvider(provider);

        if ("local".equalsIgnoreCase(provider)) {
            if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
                throw new IllegalArgumentException("Password is required for local users");
            }
            user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        } else {
            user.setPasswordHash(null);
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // This method retrieves a user by their ID and converts it to a UserDTO
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return convertToDTO(user);
    }

    // Get user by username
    public List<UserDTO> getAllUsers() {
        try {
            return userRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching all users", e);
            throw new RuntimeException("Failed to fetch users", e);
        }
    }

    @Transactional
    // Update user details
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        existingUser.setName(userDTO.getName());
        existingUser.setOccupation(userDTO.getOccupation());
        existingUser.setBirthday(userDTO.getBirthday());
        existingUser.setProfileImage(userDTO.getProfileImage());
        existingUser.setCountry(userDTO.getCountry());
        existingUser.setCity(userDTO.getCity());
        existingUser.setPostalCode(userDTO.getPostalCode());

        User updatedUser = userRepository.save(existingUser);
        return convertToDTO(updatedUser);
    }

    @Transactional
    // Delete user by ID
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional
    // Update user profile details (name, occupation, birthday)
    public UserDTO updateUserProfile(Long userId, UserDTO userDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only update profile-specific fields
        if (userDTO.getName() != null) {
            existingUser.setName(userDTO.getName());
        }
        if (userDTO.getOccupation() != null) {
            existingUser.setOccupation(userDTO.getOccupation());
        }
        if (userDTO.getBirthday() != null) {
            existingUser.setBirthday(userDTO.getBirthday());
        }
        if (userDTO.getProfileImage() != null) {
            existingUser.setProfileImage(userDTO.getProfileImage());
        }
        if (userDTO.getCountry() != null) {
            existingUser.setCountry(userDTO.getCountry());
        }
        if (userDTO.getCity() != null) {
            existingUser.setCity(userDTO.getCity());
        }
        if (userDTO.getPostalCode() != null) {
            existingUser.setPostalCode(userDTO.getPostalCode());
        }

        User updatedUser = userRepository.save(existingUser);
        return convertToDTO(updatedUser);
    }

    // Authenticate user with email and password
    public UserDTO authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return convertToDTO(user);
    }

    @Transactional
    public UserDTO saveProfileImage(Long userId, MultipartFile file) throws Exception {
        logger.info("Attempting to save profile image for userId: {}", userId);
        logger.info("Uploaded filename: {}", file.getOriginalFilename());
        logger.info("Base upload directory from properties (media.upload-dir): '{}'", baseUploadDir);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String profileImagesSubDir = "profile-images";
        Path fullUploadPath = Paths.get(baseUploadDir, profileImagesSubDir);
        logger.info("Resolved full upload directory for profile images: '{}'", fullUploadPath.toString());

        Files.createDirectories(fullUploadPath);
        logger.info("Ensured directory exists: '{}'", fullUploadPath.toString());

        String filename = "user-" + userId + "-" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
        Path filePath = fullUploadPath.resolve(filename);
        logger.info("Final resolved file path for saving: '{}'", filePath.toString());

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Successfully copied file to: '{}'", filePath.toString());
        } catch (Exception e) {
            logger.error("Failed to copy file to: '{}'", filePath.toString(), e);
            throw e;
        }

        String storedDbPath = profileImagesSubDir + "/" + filename;
        user.setProfileImage(storedDbPath);
        logger.info("Storing path in database: '{}'", storedDbPath);
        
        User updatedUser = userRepository.save(user);
        logger.info("Successfully updated user profileImage in database for userId: {}", userId);
        return convertToDTO(updatedUser);
    }

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles("USER")
                .build();
    }

    // Convert User entity to UserDTO
    public UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUserId(user.getUserId());
        userDTO.setName(user.getName());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setOccupation(user.getOccupation());
        userDTO.setBirthday(user.getBirthday());
        userDTO.setProfileImage(user.getProfileImage());
        userDTO.setCountry(user.getCountry());
        userDTO.setCity(user.getCity());
        userDTO.setPostalCode(user.getPostalCode());
        userDTO.setProvider(user.getProvider());
        return userDTO;
    }
}
