import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function BahasaPengantar() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Bahasa Pengantar',
                title: 'Bahasa Pengantar',
                routeSlug: 'master-data/bahasa-pengantar',
                columns: [{ key: 'name', label: 'Bahasa Pengantar' }],
            }}
        />
    );
}
