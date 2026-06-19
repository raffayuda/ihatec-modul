import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function JenisPerubahan() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Jenis Perubahan',
                title: 'Jenis Perubahan',
                routeSlug: 'master-data/jenis-perubahan',
                columns: [{ key: 'name', label: 'Jenis Perubahan' }],
            }}
        />
    );
}
