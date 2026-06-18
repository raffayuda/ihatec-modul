import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function KodePelatihan() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Kode Pelatihan',
                title: 'Kode Pelatihan',
                routeSlug: 'master-data/kode-pelatihan',
                columns: [
                    { key: 'name', label: 'Nama Pelatihan' },
                    { key: 'code', label: 'Kode Pelatihan' },
                ],
                supportsImport: true,
            }}
        />
    );
}
