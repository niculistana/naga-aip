# Naga AIP


**Getting Started**

1. Clone the app: `git clone https://github.com/niculistana/naga-aip.git`
2. Install `pnpm`: `npm install -g pnpm`
3. Install modules: `pnpm install`
4. Set up `.env`: the `dev` script does this automatically on Unix/macOS/Linux. See the note below for Windows.
5. Run `pnpm run dev` to start the dev server. NOTE: Root path loads all data upfront so it could take a while to load.

> **Windows users:** The `dev` and `dev:local` scripts use Unix shell commands (`cat`, `read`, `sed`) that don't work in PowerShell or Command Prompt. Use one of the following options:
> - Run from **Git Bash** or **WSL**
> - Or manually copy the env file once before running Vite:
>   ```
>   copy .env.development.example .env
>   pnpm vite
>   ```


**Main priority**

Because the root page only renders data in tubular format, it is not easy for people to understand. The main priority is to create a frontend charting tool to render meaningful charts from the following APIs:

- [Clusters](https://naga-aip-api.onrender.com/api/data/all/clusters?fields=id,name,year)
- [Agencies](https://naga-aip-api.onrender.com/api/data/all/agencies?fields=year,cluster_id,abbreviation)
- [Programs](https://naga-aip-api.onrender.com/api/data/all/programs?fields=id,nalme,implementation_start,implementation_end,aip_reference_code,agency_id)
- [Amounts](https://naga-aip-api.onrender.com/api/data/all/amounts?fields=amount,program_id,category)

**Backend development**

Please create a github issue and label it with `api-request` in-case you have any requests for backend changes. Right now the schemas are being maintained in a separate repository so you'll need to use the public API given in the `.env`

Otherwise, you could submit a PR. You need to create a database via [neon](https://neon.com) and create a github issue and label it with `schema-dump` and tag a maintainer so they can dump data to your own database instance.