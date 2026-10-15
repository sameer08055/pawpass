# PawPass

## Author

Sree Rachnae Shyam, Sai Venkatesh Varun Muruganandam Murali Krishnan

## Class Link

[Add the course link here]

## Project Objective

PawPass is a pet care app for tracking pet health and handing care off to a
sitter. Pet owners manage their pets' profiles and health records, and can
generate a read-only "Quick Facts" link to share with whoever takes over
temporary care. Sitters manage their own profile, services, and availability,
and track the sits they've booked — attaching an owner's Quick Facts link to
each booking.

Each side of the app is built independently by one team member, full-stack,
with no shared collections read by the other side.

## Screenshot

[Add a screenshot once the app is further along]

## Instructions to Build / Run Locally

1. Clone the repo:
   ```
   git clone [repo-url]
   cd pawpass
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root with your own MongoDB connection
   string:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/pawpass?retryWrites=true&w=majority
   ```
4. Run the server:
   ```
   npm start
   ```
5. Open `http://localhost:3000` in a browser.

To lint and format the code:

```
npm run lint
npm run format
```

## Tech Stack

- Node.js + Express
- MongoDB (native Node.js driver — no Mongoose)
- Vanilla HTML5, CSS3, ES6 modules (no frameworks)

## Folder Structure

```
/
├── server.js
├── db/                  — MongoDB connection + one file per collection
├── routes/              — Express routers, one per collection
├── validation/          — input validation, one file per collection
├── scripts/             — one-time seed scripts
└── public/
    ├── index.html
    ├── pages/            — one HTML file per page
    ├── css/              — one stylesheet per page/module
    └── js/               — one folder per feature, split into Api/Form/View/Page modules
```

## Use of GenAI Tools

[To be filled in — disclose any AI assistance used, per the assignment's
GenAI disclosure requirement]

## License

MIT — see [LICENSE](./LICENSE)
