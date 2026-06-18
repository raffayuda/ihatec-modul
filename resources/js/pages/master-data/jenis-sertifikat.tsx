import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function JenisSertifikat() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Jenis Sertifikat',
                title: 'Jenis Sertifikat',
                routeSlug: 'master-data/jenis-sertifikat',
                columns: [{ key: 'name', label: 'Jenis Sertifikat' }],
            }}
        />
    );
}
