plugins {
    java
    id("org.springframework.boot") version "3.5.10"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.graalvm.buildtools.native") version "0.11.0"
}

group = "com.project"
version = "0.0.1-SNAPSHOT"
description = "Scroll"

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

repositories {
    mavenCentral()
}

dependencyManagement {
    imports {
        mavenBom("com.google.cloud:spring-cloud-gcp-dependencies:5.0.0")
        mavenBom("com.google.cloud:libraries-bom:26.67.0")
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

    implementation("com.google.cloud:spring-cloud-gcp-starter-data-firestore")
    implementation("com.google.cloud:spring-cloud-gcp-starter-storage")

    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    implementation("com.google.cloud:google-cloud-firestore")

    implementation("org.springframework.boot:spring-boot-starter-mail")
}

tasks.getByName<Jar>("jar") {
    enabled = false
}

tasks.withType<org.springframework.boot.gradle.tasks.bundling.BootBuildImage> {
    builder.set("paketobuildpacks/builder-jammy-java-tiny:latest")
    environment.set(mapOf(
        "BP_NATIVE_IMAGE" to "true",
        "BP_JVM_VERSION" to "21"
    ))
}