# ThreatLightHouse

ThreatLightHouse is an advanced threat detection platform that allows you to scan files, URLs, and network ports for potential security threats. It's inspired by services like VirusTotal but integrates multiple scanning capabilities in a single application.

## Features

- **File Scanning**: Scan files for malware, viruses, and other threats
- **URL Scanning**: Check websites for malicious content, phishing, and safety issues
- **Port Scanning**: Identify open ports and potential security vulnerabilities
- **Report Generation**: View comprehensive reports of all your scans

## Tech Stack

- **Frontend**: React with React Bootstrap
- **Backend**: Python with Flask
- **Database**: Supabase
- **Scanning APIs**: VirusTotal, Python-nmap

## Installation

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/threat-light-house.git
cd threat-light-house
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment variables:
```bash
cp .env.example .env
```

5. Edit the `.env` file and add your API keys:
   - Get a VirusTotal API key from [VirusTotal](https://www.virustotal.com)
   - Set up a Supabase project and add your URL and anon key

## Running the Application

1. Start the React frontend:
```bash
npm start
```

2. In a new terminal, start the Flask backend:
```bash
npm run server
# or directly with: python api/app.py
```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploying to Vercel

1. Fork or clone this repository to your GitHub account
2. Create an account on [Vercel](https://vercel.com) if you don't have one
3. In Vercel dashboard, click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Create React App
   - Build Command: npm run build
   - Output Directory: build
   - Install Command: npm install
6. Add environment variables (if needed)
7. Click "Deploy"

Note: The frontend will work on Vercel, but you'll need to deploy the backend API separately (e.g., to Heroku, Railway, or another platform that supports Python) and update the API endpoints in your config.js file.

## Database Setup

If using Supabase, you need to create a `reports` table with the following schema:

```sql
create table public.reports (
  id uuid not null default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  type text not null,
  target text not null,
  status text not null,
  details jsonb,
  scan_id text,
  
  primary key (id)
);

-- Set up Row Level Security (RLS)
alter table public.reports enable row level security;
```

## API Information

### VirusTotal API
ThreatLightHouse uses the VirusTotal API for file and URL scanning. You need to sign up for a free or premium API key at [VirusTotal](https://www.virustotal.com).

### NMAP
The port scanning functionality uses Python-nmap, which requires Nmap to be installed on your system. If Nmap is not available, a fallback socket-based scanner will be used.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
