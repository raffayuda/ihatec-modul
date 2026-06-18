import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function JenisModul() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Jenis Modul',
                title: 'Jenis Modul',
                routeSlug: 'master-data/jenis-modul',
                columns: [{ key: 'name', label: 'Jenis Modul' }],
            }}
        />
    );
}
