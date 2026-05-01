# Naga AIP


**Getting Started**

1. Clone the app: git clone https://github.com/niculistana/naga-aip.git
2. Install `pnpm`: `npm install -g pnpm`
3. Install `vite`: `pnpm add -g vite`
3. Install modules: `pnpm install`
4. Add `.env`
5. Run `pnpm run dev` to start client dev server. NOTE: This copies public api to .env, also root path loads all data upfront so it could take a while to load.


**Main priority**

Because the root page only renders data in tubular format, it is not easy for people to understand. The main priority is to create a frontend charting tool to render meaningful charts from the following APIs:

- [Clusters](https://naga-aip-api.onrender.com/api/data/all/clusters?fields=id,name,year)
- [Agencies](https://naga-aip-api.onrender.com/api/data/all/agencies?fields=year,cluster_id,abbreviation)
- [Programs](https://naga-aip-api.onrender.com/api/data/all/programs?fields=id,nalme,implementation_start,implementation_end,aip_reference_code,agency_id)
- [Amounts](https://naga-aip-api.onrender.com/api/data/all/amounts?fields=amount,program_id,category)

**Backend development**

Please create a github issue and label it with `api-request` in-case you have any requests for backend changes. Right now the schemas are being maintained in a separate repository so you'll need to use the public API given in the `.env`

Otherwise, you could submit a PR. You need to create a database via [neon](https://neon.com) and create a github issue and label it with `schema-dump` and tag a maintainer so they can dump data to your own database instance.