package skills.storage.repos

import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import skills.storage.model.ProjDef

interface ProjDefRepo extends CrudRepository<ProjDef, Long> {

    ProjDef findByProjectId(String projectId)

    boolean existsByProjectId(String projectId)
    boolean existsByName(String projectName)

    @Query(value = "select p.* from project_definition p, user_roles u where p.project_id = u.project_id and u.user_id=?1 order by p.display_order", nativeQuery = true)
    List<ProjDef> getProjectsByUser(String userId)

    @Query(value = "SELECT COUNT(DISTINCT s.userId) from UserPoints s where s.projectId=?1")
    int calculateDistinctUsers(String projectId)

}
