import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function KodeProgram() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Kode Program',
                title: 'Kode Program',
                routeSlug: 'master-data/kode-program',
                columns: [
                    { key: 'code', label: 'Kode Program' },
                    { key: 'name', label: 'Nama Program' },
                ],
                supportsImport: true,
            }}
        />
    );
}
