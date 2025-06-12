import { expect, Page, test } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("./login");

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);

  await page.getByRole("button", { name: "Se connecter" }).click();
}

test("Login as admin", async ({ page }) => {
  await login(page, "admin@admin.tld", "admin");
});

test("Create a new study", async ({ page }) => {
  await login(page, "admin@admin.tld", "admin");

  await page.goto("./admin/studies");

  await page.getByRole("link", { name: "Créer une nouvelle étude" }).click();

  await page.getByLabel("Titre de l'étude *").fill("Test study");
  await page
    .getByLabel(
      "Projet de recherche (titre et/ou financement du projet dans lequel s'inscrit cette étude)",
    )
    .fill("Research");
  await page.getByLabel("Date de début *").fill("2025-01-01");
  await page.getByLabel("Date de fin *").fill("2025-12-31");
  await page.getByLabel("Nombre de sessions *").fill("8");
  await page
    .getByLabel("Qu'implique votre participation ? *")
    .fill(
      "Si vous acceptez de participer, vous serez invité·e à participer à des sessions de tutorat en ligne avec un tuteur de langue étrangère. Vous serez également invité à remplir des questionnaires avant et après les sessions de tutorat. Les sessions de tutorat seront enregistrées pour analyse ultérieure.Nous vous demandons de prévoir de réaliser un minimum de 8 sessions d'une heure de tutorat (donc 8 heures au total), au cours d'une période de 1 à 3 mois. Vous pouvez bien sûr en réaliser plus si vous le souhaitez. Vous pouvez cependant arrêter de participer à l'étude à tout moment.",
    );
  await page
    .getByLabel("Comment seront traitées et conservées vos données ? *")
    .fill(
      "Les données collectées (par exemple, les transcriptions des conversations, les résultats de tests, les mesures de frappe, les informations sur les participants comme l'age ou le genre) seront traitées de manière confidentielle et anonyme. Elles seront conservées après leur anonymisation intégrale et ne pourront être utilisées qu'à des fins scientifiques ou pédagogiques. Elles pourront éventuellement être partagées avec d'autres chercheurs ou enseignants, mais toujours dans ce cadre strictement de recherche ou d'enseignement.",
    );
  await page
    .getByLabel(
      "Quels sont vos droits ? Participation volontaire et retrait éventuel *",
    )
    .fill(
      "Votre participation à cette étude est volontaire. Vous pouvez à tout moment décider de ne plus participer à l'étude sans avoir à vous justifier. Vous pouvez également demander à ce que vos données soient supprimées à tout moment. Si vous avez des questions ou des préoccupations concernant cette étude, vous pouvez contacter le responsable de l'étude.",
    );
  await page.getByLabel("Organisation/Université *").fill("UCLouvain");
  await page
    .getByLabel("Adresse *")
    .fill("Place Cardinal Mercier 14, 1348 Louvain-la-Neuve");
  await page
    .getByLabel("Personne de contact/chercheur principal *")
    .fill("Serge Bibauw");
  await page
    .getByLabel("Email du PI/de la personne de contact *")
    .fill("admin@admin.tld");
  await page.getByRole("button", { name: "Créer" }).click();
});

test("Register a tutor", async ({ page }) => {
  await page.goto("./register?role=tutor");

  await page
    .getByLabel("Étude Nom de l'étude à laquelle vous participez")
    .selectOption({ label: "Test study (1 janvier - 31 décembre)" });
  await page.getByRole("link", { name: "Continuer" }).click();

  await page
    .getByRole("button", {
      name: "J'accepte de participer à l'étude telle que décrite ci-dessus.",
    })
    .click();

  await page.getByPlaceholder("Adresse e-mail").fill("tutor@tutor.tutor");
  await page.getByPlaceholder("Votre prénom, par exemple").fill("tutor");
  await page
    .getByPlaceholder("Mot de passe", { exact: true })
    .fill("tutortutor");
  await page.getByPlaceholder("Confirmer le mot de passe").fill("tutortutor");
  await page.getByRole("button", { name: "S'inscrire" }).click();

  await page
    .getByLabel(
      "Langue première Langue maternelle ou langue principale du foyer",
    )
    .selectOption("fra");
  await page
    .getByLabel("Année de naissance En quelle année êtes-vous né·e ?")
    .selectOption("2000");
  await page.getByText("Une femme").click();
  await page
    .getByPlaceholder("Présentez-vous en une phrase")
    .fill("Une courte biographie");
  await page.getByRole("button", { name: "Envoyer" }).click();

  await page.waitForTimeout(500);
  await page.getByTestId("weekday").selectOption("thursday");
  await page.getByTestId("startTime").selectOption("10:00");
  await page.getByTestId("endTime").selectOption("11:00");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Ajouter disponibilité" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Envoyer" }).click();

  await page.getByRole("link", { name: "LanguageLab" }).click();
  expect(page.url()).toBe("http://127.0.0.1:5173/");
});

test("Register a user", async ({ page }) => {
  await page.goto("./register");
  await page
    .getByLabel("Étude Nom de l'étude à laquelle vous participez")
    .selectOption({ label: "Test study (1 janvier - 31 décembre)" });
  await page.getByRole("link", { name: "Continuer" }).click();

  await page
    .getByRole("button", {
      name: "J'accepte de participer à l'étude telle que décrite ci-dessus.",
    })
    .click();

  await page.getByPlaceholder("Adresse e-mail").fill("test@test.test");
  await page.getByPlaceholder("Votre prénom, par exemple").fill("testtest");
  await page.getByPlaceholder("Mot de passe", { exact: true }).fill("testtest");
  await page.getByPlaceholder("Confirmer le mot de passe").fill("testtest");
  await page.getByRole("button", { name: "S'inscrire" }).click();

  await page
    .getByLabel(
      "Langue première Langue maternelle ou langue principale du foyer",
    )
    .selectOption("fra");
  await page
    .getByLabel("Année de naissance En quelle année êtes-vous né·e ?")
    .selectOption("2000");
  await page.getByText("Une femme").click();
  await page.getByRole("button", { name: "Envoyer" }).click();

  await page.getByRole("button", { name: "Planifier une réunion" }).click();
  await page.getByRole("button", { name: "thursday: 10:00 - 11:00" }).click();
  await page.getByRole("button", { name: "Confirmer" }).click();

  await page.getByRole("link", { name: "LanguageLab" }).click();
  expect(page.url()).toBe("http://127.0.0.1:5173/");
});
