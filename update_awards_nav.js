const fs = require("fs");

const files = fs.readdirSync(".").filter((f) => f.endsWith(".html"));

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Update nav links: home.html#awards or #awards -> awards-and-certificates.html
  content = content.replace(
    /href="[^"]*#awards"/g,
    'href="awards-and-certificates.html"',
  );

  if (file === "awards-and-certificates.html") {
    // Need to set active state and fix dropdowns
    // since we copied from who-we-are
    content = content.replace(
      'href="who-we-are.html" class="nav-a active"',
      'href="who-we-are.html" class="nav-a"',
    );
    content = content.replace(
      'href="awards-and-certificates.html" class="nav-a"',
      'href="awards-and-certificates.html" class="nav-a active"',
    );
  }

  // Also fix the active state in all dropdowns for awards

  fs.writeFileSync(file, content);
});

console.log("Navigation updated.");
